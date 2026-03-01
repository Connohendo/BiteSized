"use client";

import { CopyButton } from "@/components/CopyButton";

type BulletsCardProps = {
  bullets: string[];
};

function bulletsToCopyText(bullets: string[]): string {
  return bullets.map((b) => "- " + b.trim()).join("\n");
}

export function BulletsCard({ bullets }: BulletsCardProps) {
  if (!bullets?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Key points
        </h2>
        <CopyButton text={bulletsToCopyText(bullets)} />
      </div>
      <ul className="space-y-2 text-[var(--foreground)] text-sm">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--accent)] shrink-0">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
