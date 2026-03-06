/**
 * Simplified SM-2 spaced repetition. Quality 0-5; intervals in days.
 * EF min 1.3, start 2.5. I(1)=1, I(2)=6, I(n)=I(n-1)*EF for n>2.
 * Quality < 3 resets to I(1).
 */

export type CardSchedule = {
  ef: number;
  interval: number;
  repetitions: number;
  nextReview: number;
};

const MIN_EF = 1.3;
const INITIAL_EF = 2.5;
const I1 = 1;
const I2 = 6;

const STORAGE_KEY = "bitesized-srs";

function getStored(): Record<string, Record<number, CardSchedule>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, Record<number, CardSchedule>>) : {};
  } catch {
    return {};
  }
}

function setStored(data: Record<string, Record<number, CardSchedule>>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function nextEF(ef: number, quality: number): number {
  const q = Math.max(0, Math.min(5, quality));
  const newEF = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(MIN_EF, Math.min(2.5, newEF));
}

export function getSchedule(deckKey: string, cardIndex: number): CardSchedule | null {
  const data = getStored();
  const deck = data[deckKey];
  if (!deck || typeof deck[cardIndex] !== "object") return null;
  return deck[cardIndex] as CardSchedule;
}

export function recordReview(
  deckKey: string,
  cardIndex: number,
  quality: number,
  _totalCards: number
): CardSchedule {
  const data = getStored();
  const deck = data[deckKey] ?? {};
  const current = deck[cardIndex];

  let ef = INITIAL_EF;
  let interval = I1;
  let repetitions = 0;

  if (current) {
    ef = current.ef;
    interval = current.interval;
    repetitions = current.repetitions;
  }

  if (quality < 3) {
    interval = I1;
    repetitions = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = I1;
    } else if (repetitions === 2) {
      interval = I2;
    } else {
      interval = Math.round(interval * ef);
    }
    ef = nextEF(ef, quality);
  }

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  const next: CardSchedule = { ef, interval, repetitions, nextReview };
  deck[cardIndex] = next;
  data[deckKey] = deck;
  setStored(data);
  return next;
}

export function getDueIndices(deckKey: string, cardCount: number): number[] {
  const data = getStored();
  const deck = data[deckKey];
  const now = Date.now();
  const due: number[] = [];
  for (let i = 0; i < cardCount; i++) {
    const s = deck?.[i];
    if (!s || s.nextReview <= now) due.push(i);
  }
  return due;
}

/** Generate a stable key for a set of flashcards (e.g. for current or history item). */
export function deckKeyFromFlashcards(flashcards: { front: string; back: string }[]): string {
  const str = flashcards
    .slice(0, 20)
    .map((c) => c.front)
    .join("\n");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return `deck-${h}`;
}
