import { NextResponse } from "next/server";
import { seedKnowledgeBase } from "@/lib/rag/store";

export async function POST() {
  try {
    const result = await seedKnowledgeBase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to seed knowledge base:", error);
    return NextResponse.json({ error: "Failed to seed knowledge base" }, { status: 500 });
  }
}
