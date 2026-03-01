import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/parse";
import { generateStudyMaterials } from "@/lib/llm";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TOTAL_TEXT = 100_000;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let combinedText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textPart = formData.get("text");
      if (typeof textPart === "string" && textPart.trim()) {
        combinedText = textPart.trim();
      }

      const files = formData.getAll("files");
      for (const file of files) {
        const isFileLike =
          typeof file === "object" &&
          file !== null &&
          typeof (file as Blob).arrayBuffer === "function" &&
          "name" in file &&
          typeof (file as { size: number }).size === "number";
        if (!isFileLike) continue;
        const f = file as { name: string; size: number; type: string; arrayBuffer(): Promise<ArrayBuffer> };
        if (f.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File "${f.name}" exceeds 10 MB limit.` },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await f.arrayBuffer());
        const mime = f.type || "application/octet-stream";
        const extracted = await extractTextFromBuffer(
          buffer,
          mime,
          f.name
        );
        if (extracted) {
          combinedText += (combinedText ? "\n\n" : "") + extracted.trim();
        }
      }
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const text = body?.text ?? body?.content;
      if (typeof text === "string") {
        combinedText = text.trim();
      }
    }

    if (combinedText.length > MAX_TOTAL_TEXT) {
      combinedText = combinedText.slice(0, MAX_TOTAL_TEXT);
    }

    const text = combinedText || "";

    if (!text) {
      return NextResponse.json({
        text: "",
        summary: "",
        bullets: [],
        flashcards: [],
        keyTerms: [],
      });
    }

    const { summary, bullets, flashcards, keyTerms } =
      await generateStudyMaterials(text);

    return NextResponse.json({
      text,
      summary,
      bullets,
      flashcards,
      keyTerms,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to process input.";
    console.error("[POST /api/process]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
