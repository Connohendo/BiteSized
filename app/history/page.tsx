"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHistory, removeFromHistory } from "@/lib/history";
import type { HistoryItem } from "@/lib/types";

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(id);
    setItems(getHistory());
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          History
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Past study packs. Click to view again.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No history yet. Process a file or paste text on the Dashboard to see
          it here.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/?history=${encodeURIComponent(item.id)}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--foreground)] truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-red-400 transition-opacity"
                  aria-label="Remove from history"
                >
                  Remove
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
