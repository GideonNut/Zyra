import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS } from '@/lib/firestore';

type FeeBreakdownBody = {
  baseAmountWei: string;
  feeAmountWei: string;
  feePercentage?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, intent, feeBreakdown } = body as {
      title: string;
      description?: string;
      intent: {
        destinationChainId: number;
        destinationTokenAddress: string;
        receiver: string;
        amount: string;
      };
      feeBreakdown?: FeeBreakdownBody;
    };

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
    const linkPayload = data.data as { id?: string };

    if (
      feeBreakdown?.baseAmountWei &&
      feeBreakdown?.feeAmountWei &&
      linkPayload?.id
    ) {
      try {
        const db = getFirestoreInstance();
        await db.collection(COLLECTIONS.PAYMENT_LINK_BREAKDOWN).doc(linkPayload.id).set({
          baseAmountWei: feeBreakdown.baseAmountWei,
          feeAmountWei: feeBreakdown.feeAmountWei,
          feePercentage: feeBreakdown.feePercentage ?? 3,
          createdAt: new Date().toISOString(),
        });
      } catch (persistErr) {
        console.error('Could not persist invoice amount breakdown:', persistErr);
      }
    }

    return NextResponse.json(linkPayload);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
