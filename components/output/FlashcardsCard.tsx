"use client";

import { useState } from "react";

type FlashcardsCardProps = {
  flashcards: { front: string; back: string }[];
};

export function FlashcardsCard({ flashcards }: FlashcardsCardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards?.length) return null;

  const card = flashcards[index];
  const hasNext = index < flashcards.length - 1;
  const hasPrev = index > 0;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
        Flashcards
      </h2>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="min-h-[120px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-left text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[var(--muted)] mb-1">
            {flipped ? "Back" : "Front"}
          </p>
          <p className="text-sm">
            {flipped ? card.back : card.front}
          </p>
        </button>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setIndex((i) => Math.max(0, i - 1));
              setFlipped(false);
            }}
            disabled={!hasPrev}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--muted)]">
            {index + 1} / {flashcards.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setIndex((i) => Math.min(flashcards.length - 1, i + 1));
              setFlipped(false);
            }}
            disabled={!hasNext}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
