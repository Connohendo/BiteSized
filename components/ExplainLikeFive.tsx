"use client";

import { useState } from "react";

type ExplainLikeFiveProps = {
  text: string;
  label?: string;
};

const DEFAULT_LABEL = "Explain like I'm 5";

export function ExplainLikeFive({ text, label = DEFAULT_LABEL }: ExplainLikeFiveProps) {
  const [open, setOpen] = useState(false);
  const [simplified, setSimplified] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text?.trim() || loading) return;
    setOpen(true);
    setSimplified(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSimplified(data.simplified ?? "");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setSimplified(null);
    setError(null);
  };

  if (!text?.trim()) return null;

  return (
    <>
      <button
        type="button"
        onClick={run}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Simplified explanation"
        >
          <div
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
              <h3 className="text-lg font-medium text-[var(--foreground)]">
                {DEFAULT_LABEL}
              </h3>
              <button
                type="button"
                onClick={close}
                className="text-[var(--muted)] hover:text-[var(--foreground)] p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading && (
                <p className="text-sm text-[var(--muted)]">Simplifying…</p>
              )}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              {simplified && !loading && (
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                  {simplified}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
