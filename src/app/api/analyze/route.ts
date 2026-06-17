import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/ai/analyze";
import { saveScan } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Field 'message' is required" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long (max 4000 characters)" }, { status: 400 });
  }

  const { result, source } = await analyzeMessage(message);
  const saved = await saveScan(message, result);

  return NextResponse.json({ ...saved, source });
}
