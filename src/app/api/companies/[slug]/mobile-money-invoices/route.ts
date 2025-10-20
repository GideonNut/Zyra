import { NextResponse } from "next/server";
import { getAllCompanyInvoices } from "@/lib/company-invoice-storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const invoices = await getAllCompanyInvoices(slug);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching company invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
