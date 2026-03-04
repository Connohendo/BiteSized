"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type BulletsCardProps = {
  bullets: string[];
  defaultExpanded?: boolean;
};

function bulletsToCopyText(bullets: string[]): string {
  return bullets.map((b) => "- " + b.trim()).join("\n");
}

export function BulletsCard({ bullets, defaultExpanded = true }: BulletsCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!bullets?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
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
            Key points
          </h2>
        </div>
        <CopyButton text={bulletsToCopyText(bullets)} />
      </div>
      {expanded && (
        <ul className="space-y-2 text-[var(--foreground)] text-sm leading-relaxed">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--accent)] shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
