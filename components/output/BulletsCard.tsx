"use client";

type BulletsCardProps = {
  bullets: string[];
};

export function BulletsCard({ bullets }: BulletsCardProps) {
  if (!bullets?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
        Key points
      </h2>
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
