"use client";

import { CopyButton } from "@/components/CopyButton";

type KeyTermsCardProps = {
  keyTerms: { term: string; definition: string }[];
};

function keyTermsToCopyText(keyTerms: { term: string; definition: string }[]): string {
  return keyTerms.map((k) => `${k.term}: ${k.definition.trim()}`).join("\n\n");
}

export function KeyTermsCard({ keyTerms }: KeyTermsCardProps) {
  if (!keyTerms?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Key terms
        </h2>
        <CopyButton text={keyTermsToCopyText(keyTerms)} />
      </div>
      <dl className="space-y-3 text-sm">
        {keyTerms.map(({ term, definition }, i) => (
          <div key={i}>
            <dt className="font-medium text-[var(--foreground)]">{term}</dt>
            <dd className="text-[var(--muted)] mt-0.5 pl-0">{definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
