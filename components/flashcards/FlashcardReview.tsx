"use client";

import { useState, useCallback, useEffect } from "react";
import {
  deckKeyFromFlashcards,
  getDueIndices,
  recordReview,
} from "@/lib/srs";

type Card = { front: string; back: string };

type FlashcardReviewProps = {
  flashcards: Card[];
  onExit: () => void;
};

export function FlashcardReview({ flashcards, onExit }: FlashcardReviewProps) {
  const deckKey = deckKeyFromFlashcards(flashcards);
  const [dueQueue, setDueQueue] = useState<number[]>(() =>
    getDueIndices(deckKey, flashcards.length)
  );
  const [queueIndex, setQueueIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const currentCardIndex = dueQueue[queueIndex] ?? 0;
  const currentCard = flashcards[currentCardIndex];
  const isLast = queueIndex >= dueQueue.length - 1;
  const totalInSession = dueQueue.length;

  const startStudyAll = useCallback(() => {
    setDueQueue(flashcards.map((_, i) => i));
    setQueueIndex(0);
    setFlipped(false);
    setShowRating(false);
  }, [flashcards]);

  const handleRate = useCallback(
    (quality: number) => {
      recordReview(deckKey, currentCardIndex, quality, flashcards.length);
      setShowRating(false);
      setFlipped(false);
      if (isLast) {
        onExit();
      } else {
        setQueueIndex((i) => i + 1);
      }
    },
    [deckKey, currentCardIndex, flashcards.length, isLast, onExit]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") {
        e.preventDefault();
        if (showRating) return;
        setFlipped((f) => !f);
        if (!flipped) setShowRating(true);
      }
      if (showRating && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        handleRate(Number(e.key));
      }
      if (e.key === "ArrowRight" && showRating) {
        e.preventDefault();
        handleRate(3);
      }
      if (e.key === "ArrowLeft" && flipped && !showRating) {
        e.preventDefault();
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, showRating, handleRate]);

  if (!flashcards.length) return null;

  if (totalInSession === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">
          Review queue
        </h2>
        <p className="text-[var(--muted)] mb-4">No cards due right now. Check back later!</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startStudyAll}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
          >
            Study all
          </button>
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-white/5"
          >
            Back to flashcards
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    onExit();
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Review ({queueIndex + 1} / {totalInSession})
        </h2>
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Exit
        </button>
      </div>
      <p className="text-xs text-[var(--muted)] mb-2">
        Space to flip · 1–5 to rate · → next
      </p>
      <button
        type="button"
        onClick={() => {
          if (!flipped) setFlipped(true);
          else if (!showRating) setShowRating(true);
        }}
        className="min-h-[140px] w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-left text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
      >
        <p className="text-sm font-medium text-[var(--muted)] mb-1">
          {flipped ? "Back" : "Front"}
        </p>
        <p className="text-sm">{flipped ? currentCard.back : currentCard.front}</p>
      </button>
      {showRating && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-[var(--muted)] w-full">Rate:</span>
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleRate(q)}
              className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-sm text-[var(--foreground)] hover:bg-white/5"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      {flipped && !showRating && (
        <button
          type="button"
          onClick={() => setShowRating(true)}
          className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
        >
          Show rating
        </button>
      )}
    </div>
  );
}
