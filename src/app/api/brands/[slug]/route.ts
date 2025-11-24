import { NextResponse } from "next/server";
import { getBrandBySlug, saveBrand } from "@/lib/brand-storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const brand = await getBrandBySlug(slug);
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json(brand, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json({ error: "Failed to read brand" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await req.json();
    const { slug } = await params;
    
    // Ensure slug matches
    const brandData = {
      ...body,
      slug: slug,
      id: body.id || slug,
    };
    
    await saveBrand(brandData);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving brand:", error);
    return NextResponse.json({ error: "Failed to save brand" }, { status: 500 });
  }
}
