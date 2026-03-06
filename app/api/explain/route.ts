import { NextRequest, NextResponse } from "next/server";
import { explainLikeFive } from "@/lib/llm";

const MAX_TEXT_LENGTH = 8000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "text is required." },
        { status: 400 }
      );
    }
    const toExplain = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
    const simplified = await explainLikeFive(toExplain);
    return NextResponse.json({ simplified });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Explain failed.";
    console.error("[POST /api/explain]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
