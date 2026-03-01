import OpenAI from "openai";
import type { ProcessResult } from "./types";

const DEFAULT_FLASHCARD_COUNT = 15;

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use summaries, bullets, flashcards, and key terms."
    );
  }
  return new OpenAI({ apiKey: key });
}

export async function generateStudyMaterials(
  text: string,
  options?: { flashcardCount?: number }
): Promise<Omit<ProcessResult, "text">> {
  if (!text.trim()) {
    return {
      summary: "",
      bullets: [],
      flashcards: [],
      keyTerms: [],
    };
  }

  const openai = getClient();
  const flashcardCount = options?.flashcardCount ?? DEFAULT_FLASHCARD_COUNT;

  const systemPrompt = `You are a study assistant. Given raw text, you produce structured study materials.
Respond with a single valid JSON object (no markdown, no code fence) with exactly these keys:
- summary: string (1-3 short paragraphs summarizing the content)
- bullets: string[] (key points as bullet strings, 5-15 items)
- keyTerms: { term: string, definition: string }[] (important terms with definitions, 5-15 items)
- flashcards: { front: string, back: string }[] (exactly ${flashcardCount} flashcards; front = question or term, back = answer or definition)`;

  const userPrompt = `Extract study materials from this text:\n\n${text.slice(0, 28000)}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from the model.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  const obj = parsed as Record<string, unknown>;
  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const bullets = Array.isArray(obj.bullets)
    ? obj.bullets.filter((b): b is string => typeof b === "string")
    : [];
  const keyTerms = Array.isArray(obj.keyTerms)
    ? obj.keyTerms
        .filter(
          (k): k is { term: string; definition: string } =>
            typeof k === "object" &&
            k !== null &&
            typeof (k as { term?: unknown }).term === "string" &&
            typeof (k as { definition?: unknown }).definition === "string"
        )
        .map((k) => ({ term: k.term, definition: k.definition }))
    : [];
  const flashcards = Array.isArray(obj.flashcards)
    ? obj.flashcards
        .filter(
          (f): f is { front: string; back: string } =>
            typeof f === "object" &&
            f !== null &&
            typeof (f as { front?: unknown }).front === "string" &&
            typeof (f as { back?: unknown }).back === "string"
        )
        .map((f) => ({ front: f.front, back: f.back }))
    : [];

  return {
    summary,
    bullets,
    keyTerms,
    flashcards,
  };
}
