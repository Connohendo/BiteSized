"use client";

import { CopyButton } from "@/components/CopyButton";

type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Summary
        </h2>
        <CopyButton text={summary} />
      </div>
      <div className="text-[var(--foreground)] text-sm leading-relaxed whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}
