export type ProcessResult = {
  text: string;
  summary: string;
  bullets: string[];
  flashcards: { front: string; back: string }[];
  keyTerms: { term: string; definition: string }[];
};

export type ProcessResultPayload = ProcessResult;

export type ProcessOptions = {
  flashcardCount?: number;
  template?: "default" | "exam" | "meeting" | "research";
  language?: string;
  summaryDetail?: "brief" | "detailed";
  difficulty?: "simple" | "standard" | "advanced";
};
