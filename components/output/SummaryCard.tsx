"use client";

type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
        Summary
      </h2>
      <div className="text-[var(--foreground)] text-sm leading-relaxed whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}
