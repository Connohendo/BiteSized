import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/parse";
import { generateStudyMaterials } from "@/lib/llm";
import { fetchArticleText } from "@/lib/fetch-article";
import { getTranscriptText } from "@/lib/youtube-transcript";
import type { ProcessOptions } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TOTAL_TEXT = 100_000;

function parseOptions(raw: unknown): ProcessOptions | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parseOptions(parsed);
    } catch {
      return undefined;
    }
  }
  if (typeof raw !== "object" || raw === null) return undefined;
  const o = raw as Record<string, unknown>;
  const opts: ProcessOptions = {};
  if (typeof o.flashcardCount === "number") opts.flashcardCount = o.flashcardCount;
  if (o.template === "exam" || o.template === "meeting" || o.template === "research" || o.template === "default") opts.template = o.template;
  if (typeof o.language === "string") opts.language = o.language;
  if (o.summaryDetail === "brief" || o.summaryDetail === "detailed") opts.summaryDetail = o.summaryDetail;
  if (o.difficulty === "simple" || o.difficulty === "standard" || o.difficulty === "advanced") opts.difficulty = o.difficulty;
  return Object.keys(opts).length ? opts : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let combinedText = "";
    let options: ProcessOptions | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textPart = formData.get("text");
      if (typeof textPart === "string" && textPart.trim()) {
        combinedText = textPart.trim();
      }

      const urlPart = formData.get("url");
      if (typeof urlPart === "string" && urlPart.trim()) {
        try {
          const articleText = await fetchArticleText(urlPart.trim());
          combinedText += (combinedText ? "\n\n" : "") + articleText;
        } catch (e) {
          return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to fetch article." },
            { status: 400 }
          );
        }
      }

      const youtubePart = formData.get("youtubeUrl");
      if (typeof youtubePart === "string" && youtubePart.trim()) {
        try {
          const transcriptText = await getTranscriptText(youtubePart.trim());
          combinedText += (combinedText ? "\n\n" : "") + transcriptText;
        } catch (e) {
          return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to get YouTube transcript." },
            { status: 400 }
          );
        }
      }

      const optionsPart = formData.get("options");
      options = parseOptions(optionsPart);

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
      options = parseOptions(body?.options);
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
        quiz: [],
      });
    }

    const { summary, bullets, flashcards, keyTerms, quiz } =
      await generateStudyMaterials(text, options);

    return NextResponse.json({
      text,
      summary,
      bullets,
      flashcards,
      keyTerms,
      quiz: quiz ?? [],
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to process input.";
    console.error("[POST /api/process]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
