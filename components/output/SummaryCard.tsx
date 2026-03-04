"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ExplainLikeFive } from "@/components/ExplainLikeFive";
import { CollapseChevron } from "@/components/CollapseChevron";
import { speak } from "@/lib/tts";

type SummaryCardProps = {
  summary: string;
  defaultExpanded?: boolean;
};

export function SummaryCard({ summary, defaultExpanded = true }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 min-w-0 rounded text-left text-[var(--foreground)] hover:opacity-80 transition-opacity"
          aria-expanded={expanded}
        >
          <CollapseChevron expanded={expanded} className="text-[var(--muted)]" />
          <h2 className="text-lg font-medium">
            Summary
          </h2>
        </button>
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
      {expanded && (
        <div className="text-[var(--foreground)] text-sm leading-relaxed whitespace-pre-wrap mt-1">
          {summary}
        </div>
      )}
    </div>
  );
}
