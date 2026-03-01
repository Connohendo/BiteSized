"use client";

type KeyTermsCardProps = {
  keyTerms: { term: string; definition: string }[];
};

export function KeyTermsCard({ keyTerms }: KeyTermsCardProps) {
  if (!keyTerms?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
        Key terms
      </h2>
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
