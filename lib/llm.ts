import OpenAI from "openai";
import type { ProcessResult, ProcessOptions } from "./types";

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

function buildSystemPrompt(opts: {
  flashcardCount: number;
  template?: ProcessOptions["template"];
  language?: string;
  summaryDetail?: ProcessOptions["summaryDetail"];
  difficulty?: ProcessOptions["difficulty"];
}): string {
  const lang = opts.language?.trim() || "English";
  const outputIn = `Produce all output in ${lang}.`;

  const summaryGuidance =
    opts.summaryDetail === "detailed"
      ? "summary: string (2-4 detailed paragraphs, include nuance and context)"
      : "summary: string (1-3 short, concise paragraphs)";

  const difficultyGuidance =
    opts.difficulty === "simple"
      ? "Use simple language suitable for beginners."
      : opts.difficulty === "advanced"
        ? "Use precise, technical language where appropriate."
        : "Use clear, standard language.";

  const templateGuidance =
    opts.template === "exam"
      ? "Focus on concepts likely to appear on exams: definitions, key facts, comparisons."
      : opts.template === "meeting"
        ? "Focus on decisions, action items, and main takeaways."
        : opts.template === "research"
          ? "Focus on methodology, findings, and implications; use an academic tone."
          : "";

  return `You are a study assistant. Given raw text, you produce structured study materials.
${outputIn}
${difficultyGuidance}
${templateGuidance ? templateGuidance + "\n" : ""}
Respond with a single valid JSON object (no markdown, no code fence) with exactly these keys:
- ${summaryGuidance}
- bullets: string[] (key points as bullet strings, 5-15 items)
- keyTerms: { term: string, definition: string }[] (important terms with definitions, 5-15 items)
- flashcards: { front: string, back: string }[] (exactly ${opts.flashcardCount} flashcards; front = question or term, back = answer or definition)`;
}

export async function generateStudyMaterials(
  text: string,
  options?: ProcessOptions
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
  const flashcardCount =
    options?.flashcardCount ?? DEFAULT_FLASHCARD_COUNT;
  const systemPrompt = buildSystemPrompt({
    flashcardCount,
    template: options?.template,
    language: options?.language,
    summaryDetail: options?.summaryDetail,
    difficulty: options?.difficulty,
  });

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
