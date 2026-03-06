import OpenAI from "openai";
import type { ProcessResult, ProcessOptions, QuizQuestion, CompareResult, OutlineNode } from "./types";

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
- flashcards: { front: string, back: string }[] (exactly ${opts.flashcardCount} flashcards; front = question or term, back = answer or definition)
- quiz: { question: string, options: string[], correctIndex: number, explanation: string }[] (exactly 8 multiple-choice questions; options has 4 strings, correctIndex is 0-3; explanation is a brief explanation of the correct answer)
- outline: { title: string, children?: same structure }[] (hierarchical outline of the document: top-level array of nodes, each node has title and optional children array for nested sections)
- mindMap: string (a valid Mermaid flowchart diagram: use flowchart TD or LR, define nodes like A[Label] and edges like A --> B or A --- B; represent main concepts and their relationships from the document; no code fence, no markdown, just the raw Mermaid line(s))`;
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
      quiz: [],
      outline: [],
      mindMap: "",
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

  const quiz: QuizQuestion[] = Array.isArray(obj.quiz)
    ? obj.quiz
        .filter((q): q is { question: string; options: string[]; correctIndex: number; explanation?: string } => {
          if (typeof q !== "object" || q === null) return false;
          const o = q as Record<string, unknown>;
          if (typeof o.question !== "string") return false;
          if (!Array.isArray(o.options) || o.options.length !== 4) return false;
          if (o.options.some((opt: unknown) => typeof opt !== "string")) return false;
          const idx = Number(o.correctIndex);
          if (!Number.isInteger(idx) || idx < 0 || idx > 3) return false;
          return true;
        })
        .map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: typeof q.explanation === "string" ? q.explanation : undefined,
        }))
    : [];

  const outline = parseOutline(obj.outline);
  const mindMap = typeof obj.mindMap === "string" ? obj.mindMap.trim() : "";

  return {
    summary,
    bullets,
    keyTerms,
    flashcards,
    quiz,
    outline,
    mindMap,
  };
}

function parseOutline(raw: unknown): OutlineNode[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((n): n is Record<string, unknown> => typeof n === "object" && n !== null)
    .map((n) => {
      const title = typeof n.title === "string" ? n.title : "";
      const children = Array.isArray(n.children) ? parseOutline(n.children) : undefined;
      return { title, children };
    })
    .filter((n) => n.title.length > 0);
}

export async function generateComparison(
  text1: string,
  text2: string
): Promise<CompareResult> {
  if (!text1.trim() || !text2.trim()) {
    return { summary: "", bullets: [] };
  }

  const openai = getClient();
  const prompt = `You are comparing two documents. Provide:
1. A comparison summary (2-4 paragraphs): main similarities, differences, and how they relate.
2. A merged bullet list of key points from both documents (10-20 bullets), noting which document each point comes from when relevant (e.g. "Doc A: ..." or "Both: ...").

Respond with a single valid JSON object (no markdown, no code fence) with exactly these keys:
- summary: string
- bullets: string[]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Document 1:\n\n${text1.slice(0, 14000)}\n\n---\n\nDocument 2:\n\n${text2.slice(0, 14000)}`,
      },
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

  return { summary, bullets };
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function answerFromDocument(
  documentText: string,
  messages: ChatMessage[]
): Promise<string> {
  if (!documentText?.trim()) {
    throw new Error("No document content to answer from.");
  }

  const openai = getClient();
  const systemPrompt = `You are a helpful assistant. Answer the user's questions using ONLY the following document. Quote or paraphrase from the document when relevant. If the answer cannot be found in the document, say so clearly. Keep answers concise.`;

  const docSnippet = documentText.slice(0, 28000);
  const conversation = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: `Document:\n\n${docSnippet}` },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
    temperature: 0.3,
    max_tokens: 1024,
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? "";
  return reply || "I couldn't generate a response.";
}

export async function explainLikeFive(text: string): Promise<string> {
  if (!text?.trim()) {
    throw new Error("No text to simplify.");
  }

  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You explain things in very simple terms, as if to a curious 5-year-old. Use short sentences, simple words, and concrete examples. Keep the same main ideas but make them easy for anyone to understand. Do not use markdown or bullet points unless the user's text had them.",
      },
      {
        role: "user",
        content: `Explain the following in simple terms:\n\n${text.slice(0, 8000)}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });

  const out = completion.choices[0]?.message?.content?.trim() ?? "";
  return out || "I couldn't simplify that.";
}
