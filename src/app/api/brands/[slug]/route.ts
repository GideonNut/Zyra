import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

function brandPath(slug: string) {
  return path.join(process.cwd(), "public", "brands", slug, "brand.json");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = brandPath(slug);
    const data = await fs.readFile(filePath, "utf-8");
    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const e = err as { code?: string } | null;
    if (e && e.code === "ENOENT") {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
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
    const filePath = brandPath(slug);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save brand" }, { status: 500 });
  }
}
