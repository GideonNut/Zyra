import { NextRequest, NextResponse } from 'next/server';
import { saveCompanyInvoice } from '@/lib/company-invoice-storage';
import { getBrandBySlug } from '@/lib/brand-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, amount, currency, description, email, companySlug, skipPayment, paymentMethod } = body;

    const isCashSale = paymentMethod === 'cash';
    const isManualMobileSale = !!skipPayment && !isCashSale;

    // Validate required fields
    if (!customerName || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (isCashSale || isManualMobileSale) {
      if (!companySlug) {
        return NextResponse.json(
          { error: 'Company slug required for manual sales' },
          { status: 400 }
        );
      }

      const brand = await getBrandBySlug(companySlug);
      if (isCashSale && !brand?.payment?.cashEnabled) {
        return NextResponse.json(
          { error: 'Cash payments are not enabled for this company' },
          { status: 403 }
        );
      }
      if (isManualMobileSale && !brand?.payment?.skipPayments) {
        return NextResponse.json(
          { error: 'Manual sale recording is not enabled for this company' },
          { status: 403 }
        );
      }

      const reference = `${isCashSale ? 'cash' : 'manual'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const recordedPaymentMethod: 'cash' | 'mobile_money' = isCashSale ? 'cash' : 'mobile_money';
      const invoiceData = {
        title: customerName,
        description: description || `${isCashSale ? 'Cash' : 'Manual'} sale recorded for ${customerName}`,
        amount: amount.toString(),
        currency,
        paymentMethod: recordedPaymentMethod,
        reference,
        customer: {
          email: email || `${phoneNumber || 'unknown'}@mobilemoney.gh`,
          phone: phoneNumber,
        },
        paid_at: new Date().toISOString(),
        metadata: {
          skip_payment: !isCashSale,
          cash_payment: isCashSale,
          customer_name: customerName,
          phone_number: phoneNumber,
          original_amount: parseFloat(amount),
          original_currency: currency,
        },
      };

      const savedInvoice = await saveCompanyInvoice(companySlug, invoiceData);
      return NextResponse.json({
        success: true,
        manual: true,
        invoiceId: savedInvoice.id,
        reference: savedInvoice.reference,
      });
    }

    // Convert amount to kobo (Paystack uses kobo for GHS and cents for USD)
    const amountInKobo = Math.round(parseFloat(amount) * (currency === 'GHS' ? 100 : 100));

    if (companySlug) {
      const brand = await getBrandBySlug(companySlug);
      const mobileMoneyEnabled =
        !!brand?.payment?.mobileMoneyEnabled && !!brand?.payment?.paystackPublicKey;
      if (!mobileMoneyEnabled) {
        return NextResponse.json(
          { error: 'Mobile money is not enabled for this company' },
          { status: 403 }
        );
      }
    }

    // Generate a unique reference
    const reference = `zyra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || `${phoneNumber}@mobilemoney.gh`,
        amount: amountInKobo,
        currency: currency,
        reference: reference,
        metadata: {
          customer_name: customerName,
          phone_number: phoneNumber,
          description: description,
          company_slug: companySlug || null,
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/callback`,
      }),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error('Paystack initialization failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: paystackResponse.status }
      );
    }

    const data = await paystackResponse.json();

    return NextResponse.json({
      reference: reference,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      email: email || `${phoneNumber}@mobilemoney.gh`,
      amount: amountInKobo,
      currency: currency,
    });
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
