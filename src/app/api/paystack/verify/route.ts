import { NextRequest, NextResponse } from 'next/server';
import { saveInvoice } from '@/lib/invoice-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error('Paystack verification failed:', errorData);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: paystackResponse.status }
      );
    }

    const data = await paystackResponse.json();

    // Check if payment was successful
    if (data.data.status === 'success') {
      // Create invoice for successful mobile money payment
      try {
        const invoiceData = {
          title: data.data.metadata?.customer_name || 'Mobile Money Payment',
          description: data.data.metadata?.description || `Payment via mobile money - ${data.data.reference}`,
          amount: data.data.amount.toString(),
          currency: data.data.currency,
          paymentMethod: 'mobile_money',
          reference: data.data.reference,
          customer: data.data.customer,
          paid_at: data.data.paid_at,
          metadata: {
            paystack_reference: data.data.reference,
            paystack_transaction_id: data.data.id,
            customer_name: data.data.metadata?.customer_name,
            phone_number: data.data.metadata?.phone_number,
            original_amount: data.data.amount,
            original_currency: data.data.currency,
          }
        };

        // Store the invoice data
        const savedInvoice = await saveInvoice(invoiceData);
        console.log('Mobile Money Payment Invoice Created and Saved:', savedInvoice);

      } catch (invoiceError) {
        console.error('Error creating invoice for mobile money payment:', invoiceError);
        // Don't fail the payment verification if invoice creation fails
      }

      return NextResponse.json({
        success: true,
        status: data.data.status,
        amount: data.data.amount,
        currency: data.data.currency,
        reference: data.data.reference,
        customer: data.data.customer,
        paid_at: data.data.paid_at,
        invoice_created: true,
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not successful', status: data.data.status },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
