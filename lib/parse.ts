import mammoth from "mammoth";
import OpenAI from "openai";

const PDF_PARSE_MAX_LENGTH = 50_000;

const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function isImage(mimeType: string, filename: string): boolean {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
  return (
    IMAGE_MIMES.includes(mimeType) ||
    imageExts.includes(ext)
  );
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";

  if (mimeType === "application/pdf" || ext === "pdf") {
    return extractPdf(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    ext === "docx" ||
    ext === "doc"
  ) {
    return extractDocx(buffer);
  }
  if (mimeType === "text/plain" || ext === "txt") {
    return buffer.toString("utf-8");
  }
  if (isImage(mimeType, filename)) {
    return extractTextFromImage(buffer, mimeType);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is required for image OCR. Add it to .env.local."
    );
  }
  const openai = new OpenAI({ apiKey: key });
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text from this image. Preserve structure (paragraphs, lists) where visible. Return only the extracted text, no commentary.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!text) {
    throw new Error("No text could be extracted from the image.");
  }
  return text;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require("pdf-parse") as (
      data: Buffer,
      opts?: { max?: number }
    ) => Promise<{ text: string }>;
    const data = await pdfParse(buffer, { max: PDF_PARSE_MAX_LENGTH });
    return typeof data.text === "string" ? data.text : "";
  } catch (e) {
    throw new Error(
      `Failed to parse PDF: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
