import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, intent, feeConfig } = body;

    // If there's a fee recipient, create two separate payment links:
    // 1. One for the base amount to the main receiver
    // 2. One for the fee amount to the fee recipient
    if (feeConfig?.feeRecipient && feeConfig?.feeAmountInWei) {
      try {
        // Create main payment link for base amount
        const mainResponse = await fetch('https://payments.thirdweb.com/v1/developer/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-secret-key': process.env.THIRDWEB_SECRET_KEY!,
          },
          body: JSON.stringify({
            title: `${title} - Base Payment`,
            description: description,
            intent,
          }),
        });

        if (!mainResponse.ok) {
          const errorData = await mainResponse.json();
          console.error('Main payment link creation failed:', errorData);
          return NextResponse.json(
            { error: 'Failed to create main payment link' },
            { status: mainResponse.status }
          );
        }

        const mainData = await mainResponse.json();

        // Create fee payment link for fee amount
        const feeResponse = await fetch('https://payments.thirdweb.com/v1/developer/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-secret-key': process.env.THIRDWEB_SECRET_KEY!,
          },
          body: JSON.stringify({
            title: `${title} - Processing Fee`,
            description: `3% Processing Fee`,
            intent: {
              destinationChainId: intent.destinationChainId,
              destinationTokenAddress: intent.destinationTokenAddress,
              receiver: feeConfig.feeRecipient,
              amount: feeConfig.feeAmountInWei,
            },
          }),
        });

        if (!feeResponse.ok) {
          const errorData = await feeResponse.json();
          console.error('Fee payment link creation failed:', errorData);
          return NextResponse.json(
            { error: 'Failed to create fee payment link' },
            { status: feeResponse.status }
          );
        }

        const feeData = await feeResponse.json();

        // Return both payment links
        return NextResponse.json({
          ...mainData.data,
          feeLink: feeData.data,
          splits: {
            main: mainData.data,
            fee: feeData.data,
          }
        });
      } catch (error) {
        console.error('Error creating split payment links:', error);
        return NextResponse.json(
          { error: 'Failed to create payment links' },
          { status: 500 }
        );
      }
    }

    // Standard single payment link (no fee splitting)
    const response = await fetch('https://payments.thirdweb.com/v1/developer/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': process.env.THIRDWEB_SECRET_KEY!,
      },
      body: JSON.stringify({
        title,
        description,
        intent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment link creation failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}