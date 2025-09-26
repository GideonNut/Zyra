import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, amount, currency, description, email } = body;

    // Validate required fields
    if (!customerName || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert amount to kobo (Paystack uses kobo for GHS and cents for USD)
    const amountInKobo = Math.round(parseFloat(amount) * (currency === 'GHS' ? 100 : 100));

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
