import mammoth from "mammoth";

const PDF_PARSE_MAX_LENGTH = 50_000;

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

  throw new Error(`Unsupported file type: ${mimeType}`);
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
