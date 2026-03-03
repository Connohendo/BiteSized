"use client";

import { useState, useCallback } from "react";
import type { QuizQuestion } from "@/lib/types";

type QuizCardProps = {
  questions: QuizQuestion[];
};

export function QuizCard({ questions }: QuizCardProps) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const handleOptionClick = useCallback(
    (optionIndex: number, correctIndex: number) => {
      if (answered) return;
      setSelected(optionIndex);
      setAnswered(true);
      if (optionIndex === correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered]
  );

  const handleNext = useCallback(() => {
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }, []);

  const handleRestart = useCallback(() => {
    setStarted(false);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
  }, []);

  const quiz = questions ?? [];
  if (!quiz.length) return null;

  const current = quiz[index];
  const isLast = index === quiz.length - 1;

  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-2">
          Quiz
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          {quiz.length} multiple-choice questions based on your content.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Start quiz
        </button>
      </div>
    );
  }

  if (index >= quiz.length) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-2">
          Quiz complete
        </h2>
        <p className="text-[var(--foreground)] mb-1">
          You got {score} out of {quiz.length} correct ({pct}%).
        </p>
        <p className="text-sm text-[var(--muted)] mb-4">
          {pct >= 80 ? "Great job!" : pct >= 60 ? "Not bad. Review and try again." : "Keep studying and try again."}
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-white/5"
        >
          Restart quiz
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Quiz
        </h2>
        <span className="text-sm text-[var(--muted)]">
          {index + 1} / {quiz.length}
        </span>
      </div>
      <p className="text-[var(--foreground)] mb-4">{current.question}</p>
      <ul className="space-y-2">
        {current.options.map((option, i) => {
          const isCorrect = i === current.correctIndex;
          const isChosen = selected === i;
          let style = "rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 text-left text-sm text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors ";
          if (answered) {
            if (isCorrect) style += " border-green-500/60 bg-green-500/10";
            else if (isChosen && !isCorrect) style += " border-red-500/50 bg-red-500/10";
          }
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleOptionClick(i, current.correctIndex)}
                disabled={answered}
                className={`w-full ${style} disabled:cursor-default`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            {isLast ? "See results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
