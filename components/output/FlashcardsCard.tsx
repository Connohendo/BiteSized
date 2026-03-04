"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FlashcardReview } from "@/components/flashcards/FlashcardReview";
import { speak } from "@/lib/tts";

type FlashcardsCardProps = {
  flashcards: { front: string; back: string }[];
  defaultExpanded?: boolean;
};

function flashcardsToCopyText(flashcards: { front: string; back: string }[]): string {
  return flashcards.map((c) => `${c.front}\t${c.back}`).join("\n");
}

export function FlashcardsCard({ flashcards, defaultExpanded = false }: FlashcardsCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const hasNext = flashcards?.length ? index < flashcards.length - 1 : false;
  const hasPrev = index > 0;

  useEffect(() => {
    if (reviewMode || !flashcards?.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        setIndex((i) => i - 1);
        setFlipped(false);
      }
      if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        setIndex((i) => i + 1);
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reviewMode, hasPrev, hasNext, flashcards?.length]);

  if (!flashcards?.length) return null;

  if (reviewMode) {
    return (
      <FlashcardReview
        flashcards={flashcards}
        onExit={() => setReviewMode(false)}
      />
    );
  }

  const card = flashcards[index];

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-[var(--muted)] hover:bg-white/5"
            aria-expanded={expanded}
          >
            {expanded ? "▼" : "▶"}
          </button>
          <h2 className="text-lg font-medium text-[var(--foreground)]">
            Flashcards
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setReviewMode(true)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Review now
          </button>
          <button
            type="button"
            onClick={() => speak(`Front. ${card.front}. Back. ${card.back}`)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Read aloud
          </button>
          <CopyButton text={flashcardsToCopyText(flashcards)} />
        </div>
      </div>
      {expanded && (
        <>
        <p className="text-xs text-[var(--muted)] mb-1">
          Space to flip · ← → to navigate
        </p>
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
        </>
      )}
    </div>
  );
}
