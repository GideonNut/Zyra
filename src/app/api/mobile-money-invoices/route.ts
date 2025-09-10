import { NextResponse } from 'next/server';
import { getAllInvoices } from '@/lib/invoice-storage';

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching mobile money invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
