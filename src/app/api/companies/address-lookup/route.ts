import { NextRequest, NextResponse } from 'next/server';
import { 
  getCompanyByAddress
} from '@/lib/address-to-company';

/**
 * GET /api/companies/address-lookup?address=0x...
 * Lookup a company by its address (blockchain or physical)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const company = await getCompanyByAddress(address);

    if (!company) {
      return NextResponse.json(
        { error: 'No company found for this address' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error looking up company by address:', error);
    return NextResponse.json(
      { error: 'Failed to lookup company' },
      { status: 500 }
    );
  }
}
