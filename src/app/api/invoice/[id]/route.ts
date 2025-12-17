import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices } from '@/lib/invoice-storage';
import { getCompanyInvoiceById } from '@/lib/company-invoice-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get('companySlug');
    
    // Try company-scoped invoice first if company slug is provided
    if (companySlug) {
      const companyInvoice = await getCompanyInvoiceById(id, companySlug);
      if (companyInvoice) {
        return NextResponse.json({ data: companyInvoice });
      }
    } else {
      // Try without company slug (for backward compatibility)
      const companyInvoice = await getCompanyInvoiceById(id);
      if (companyInvoice) {
        return NextResponse.json({ data: companyInvoice });
      }
    }
    
    // Fallback to old invoice storage (for backward compatibility)
    const invoices = await getAllInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
