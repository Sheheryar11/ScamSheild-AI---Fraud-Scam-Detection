import { NextRequest, NextResponse } from "next/server";
import { getAllScans, deleteScan } from "@/lib/db";

export async function GET() {
  const scans = getAllScans(50);
  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Query param 'id' is required" }, { status: 400 });
  }
  deleteScan(Number(id));
  return NextResponse.json({ ok: true });
}
