import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/parse";
import { generateComparison } from "@/lib/llm";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_LENGTH = 50_000;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Send multipart/form-data with text1/text2 or file1/file2." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    let text1 = (formData.get("text1") as string)?.trim() ?? "";
    let text2 = (formData.get("text2") as string)?.trim() ?? "";

    const file1 = formData.get("file1");
    const file2 = formData.get("file2");

    if (file1 && typeof file1 === "object" && "arrayBuffer" in file1) {
      const f = file1 as { size: number; arrayBuffer(): Promise<ArrayBuffer>; name: string; type: string };
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File 1 exceeds 10 MB limit." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await f.arrayBuffer());
      text1 = (await extractTextFromBuffer(buffer, f.type, f.name)).trim();
    }

    if (file2 && typeof file2 === "object" && "arrayBuffer" in file2) {
      const f = file2 as { size: number; arrayBuffer(): Promise<ArrayBuffer>; name: string; type: string };
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File 2 exceeds 10 MB limit." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await f.arrayBuffer());
      text2 = (await extractTextFromBuffer(buffer, f.type, f.name)).trim();
    }

    if (!text1 || !text2) {
      return NextResponse.json(
        { error: "Provide both document 1 and document 2 (as text or files)." },
        { status: 400 }
      );
    }

    if (text1.length > MAX_TEXT_LENGTH) text1 = text1.slice(0, MAX_TEXT_LENGTH);
    if (text2.length > MAX_TEXT_LENGTH) text2 = text2.slice(0, MAX_TEXT_LENGTH);

    const { summary, bullets } = await generateComparison(text1, text2);

    return NextResponse.json({
      summary,
      bullets,
      text1: text1.slice(0, 500) + (text1.length > 500 ? "…" : ""),
      text2: text2.slice(0, 500) + (text2.length > 500 ? "…" : ""),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to compare documents.";
    console.error("[POST /api/compare]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
