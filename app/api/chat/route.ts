import { NextRequest, NextResponse } from "next/server";
import { answerFromDocument } from "@/lib/llm";

const MAX_DOC_LENGTH = 50_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentText = typeof body.documentText === "string" ? body.documentText.trim() : "";
    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (m: unknown): m is { role: "user" | "assistant"; content: string } => {
              if (typeof m !== "object" || m === null) return false;
              const o = m as { role?: string; content?: unknown };
              return (
                (o.role === "user" || o.role === "assistant") &&
                typeof o.content === "string"
              );
            }
          )
          .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }))
      : [];

    if (!documentText) {
      return NextResponse.json(
        { error: "documentText is required." },
        { status: 400 }
      );
    }

    const doc = documentText.length > MAX_DOC_LENGTH
      ? documentText.slice(0, MAX_DOC_LENGTH)
      : documentText;

    const reply = await answerFromDocument(doc, messages);

    return NextResponse.json({ message: reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat failed.";
    console.error("[POST /api/chat]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
