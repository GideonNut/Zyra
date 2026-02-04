import { NextRequest, NextResponse } from 'next/server';
import { getMerchantTransactions, getTransaction } from '@/lib/transaction-registry';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('id');
    const merchantAddress = searchParams.get('merchant');

    if (transactionId) {
      const tx = await getTransaction(BigInt(transactionId));
      return NextResponse.json(tx);
    }

    if (merchantAddress) {
      const txIds = await getMerchantTransactions(merchantAddress);
      return NextResponse.json({ transactionIds: txIds });
    }

    return NextResponse.json(
      { error: 'Please provide either id or merchant parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction data' },
      { status: 500 }
    );
  }
}
