import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCompanyAddresses,
  addCompanyAddress,
  removeCompanyAddress,
  updateCompanyAddress,
} from '@/lib/address-to-company';

interface CompanyAddressUpdate {
  isPrimary?: boolean;
  type?: 'blockchain' | 'physical';
}

/**
 * GET /api/companies/[slug]/addresses
 * Get all addresses for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const addresses = await getAllCompanyAddresses(slug);
    
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching company addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company addresses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies/[slug]/addresses
 * Add a new address to a company
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { address, type = 'blockchain', isPrimary = false } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const companyAddress = await addCompanyAddress(slug, address, type, isPrimary);
    
    return NextResponse.json(companyAddress, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding company address:', errorMessage);
    return NextResponse.json(
      { error: errorMessage || 'Failed to add company address' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[slug]/addresses?id=...
 * Remove an address from a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Note: params is required by Next.js even if not used in GET params
    void params; // Suppress unused variable warning
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const success = await removeCompanyAddress(addressId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error removing company address:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to remove address' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[slug]/addresses?id=...
 * Update an address for a company
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Note: params is required by Next.js even if not used in GET params
    void params; // Suppress unused variable warning
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');
    const body = await request.json() as CompanyAddressUpdate;

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateCompanyAddress(addressId, body);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating company address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}
