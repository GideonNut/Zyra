import { NextRequest, NextResponse } from 'next/server';
import { updateBrandInventory } from '@/lib/brand-storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!slug) {
      return NextResponse.json({ error: 'Company slug is required' }, { status: 400 });
    }

    const updatedBrand = await updateBrandInventory(slug, items);

    if (!updatedBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, brand: updatedBrand });
  } catch (error) {
    console.error('Error updating brand inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
