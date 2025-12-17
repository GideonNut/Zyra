import { NextRequest, NextResponse } from 'next/server';
import { getAllCompanyInvoices } from '@/lib/company-invoice-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get('companySlug');
    
    // Require company slug for isolation
    if (!companySlug) {
      // Return empty array if no company slug provided (for backward compatibility, but isolated)
      return NextResponse.json({ invoices: [] });
    }
    
    const invoices = await getAllCompanyInvoices(companySlug);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching mobile money invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
