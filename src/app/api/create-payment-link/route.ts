import { NextRequest, NextResponse } from 'next/server';
import { saveCompanyCryptoInvoice } from '@/lib/crypto-invoice-storage';
import { savePaymentLinkMeta } from '@/lib/payment-link-storage';

type FeeBreakdownBody = {
  baseAmountWei: string;
  feeAmountWei: string;
  feePercentage?: number;
};

type DestinationTokenBody = {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, intent, feeBreakdown, companySlug, destinationToken } = body as {
      title: string;
      description?: string;
      intent: {
        destinationChainId: number;
        destinationTokenAddress: string;
        receiver: string;
        amount: string;
      };
      feeBreakdown?: FeeBreakdownBody;
      companySlug?: string;
      destinationToken?: DestinationTokenBody;
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
    const linkPayload = data.data as { id?: string; link?: string };

    if (linkPayload?.id) {
      try {
        await savePaymentLinkMeta(linkPayload.id, {
          companySlug: companySlug ?? null,
          ...(feeBreakdown?.baseAmountWei && feeBreakdown?.feeAmountWei
            ? {
                baseAmountWei: feeBreakdown.baseAmountWei,
                feeAmountWei: feeBreakdown.feeAmountWei,
                feePercentage: feeBreakdown.feePercentage ?? 3,
              }
            : {}),
        });

        if (companySlug && destinationToken) {
          await saveCompanyCryptoInvoice(companySlug, {
            paymentLinkId: linkPayload.id,
            title,
            description,
            amount: intent.amount,
            receiver: intent.receiver,
            destinationToken,
            status: 'unpaid',
          });
        }
      } catch (persistErr) {
        console.error('Could not persist payment link metadata:', persistErr);
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
