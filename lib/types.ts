export type ProcessResult = {
  text: string;
  summary: string;
  bullets: string[];
  flashcards: { front: string; back: string }[];
  keyTerms: { term: string; definition: string }[];
};

export type ProcessResultPayload = ProcessResult;
