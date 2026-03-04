"use client";

import { CopyButton } from "@/components/CopyButton";
import { ExplainLikeFive } from "@/components/ExplainLikeFive";
import { speak } from "@/lib/tts";

type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Summary
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speak(summary)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Read aloud
          </button>
          <ExplainLikeFive text={summary} />
          <CopyButton text={summary} />
        </div>
      </div>
      <div className="text-[var(--foreground)] text-sm leading-relaxed whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}
