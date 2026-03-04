"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type KeyTermsCardProps = {
  keyTerms: { term: string; definition: string }[];
  defaultExpanded?: boolean;
};

function keyTermsToCopyText(keyTerms: { term: string; definition: string }[]): string {
  return keyTerms.map((k) => `${k.term}: ${k.definition.trim()}`).join("\n\n");
}

export function KeyTermsCard({ keyTerms, defaultExpanded = false }: KeyTermsCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!keyTerms?.length) return null;

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
            Key terms
          </h2>
        </div>
        <CopyButton text={keyTermsToCopyText(keyTerms)} />
      </div>
      {expanded && (
        <dl className="space-y-3 text-sm leading-relaxed">
          {keyTerms.map(({ term, definition }, i) => (
            <div key={i}>
              <dt className="font-medium text-[var(--foreground)]">{term}</dt>
              <dd className="text-[var(--muted)] mt-0.5 pl-0">{definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
