export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type OutlineNode = {
  title: string;
  children?: OutlineNode[];
};

export type ProcessResult = {
  text: string;
  summary: string;
  bullets: string[];
  flashcards: { front: string; back: string }[];
  keyTerms: { term: string; definition: string }[];
  quiz: QuizQuestion[];
  outline: OutlineNode[];
  mindMap: string;
};

export type HistoryItem = {
  id: string;
  createdAt: number;
  title: string;
  result: ProcessResult;
};

export type ProcessResultPayload = ProcessResult;

export type ProcessOptions = {
  flashcardCount?: number;
  template?: "default" | "exam" | "meeting" | "research";
  language?: string;
  summaryDetail?: "brief" | "detailed";
  difficulty?: "simple" | "standard" | "advanced";
};

export type CompareResult = {
  summary: string;
  bullets: string[];
};
