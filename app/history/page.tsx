"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHistory, removeFromHistory } from "@/lib/history";
import { serializePack } from "@/lib/share";
import { AddToCollectionDropdown } from "@/components/AddToCollectionDropdown";
import { ImportModal, type ImportResult } from "@/components/ImportModal";
import { useToast } from "@/components/Toast";
import type { HistoryItem } from "@/lib/types";

function safeFilename(title: string): string {
  const base = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || "pack";
  return `${base}.bitesized.json`;
}

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
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleShareDownload = (e: React.MouseEvent, item: HistoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    const json = serializePack(item);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename(item.title);
    a.click();
    URL.revokeObjectURL(url);
    showToast("Pack saved");
  };

  const handleShareCopy = async (e: React.MouseEvent, item: HistoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(serializePack(item));
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(id);
    setItems(getHistory());
  };

  const handleImported = (importResult: ImportResult) => {
    setItems(getHistory());
    if (importResult.type === "pack") {
      showToast("Added to History");
      router.push(`/?history=${encodeURIComponent(importResult.item.id)}`);
    } else {
      showToast(`Collection "${importResult.collection.name}" imported with ${importResult.collection.packs.length} packs`);
      router.push(`/collections/${encodeURIComponent(importResult.collection.id)}`);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded">
            ← Dashboard
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          History
        </h1>
        <p className="text-[var(--muted)] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Past study packs. Click to view again.</span>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
          >
            Import pack or collection
          </button>
        </p>
      </div>
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={handleImported}
      />

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
                <span
                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <AddToCollectionDropdown
                    historyItemId={item.id}
                    onAdded={() => setItems(getHistory())}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleShareDownload(e, item)}
                    className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-label="Export pack"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleShareCopy(e, item)}
                    className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-label="Copy pack"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.id)}
                    className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-red-400 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-label="Remove from history"
                  >
                    Remove
                  </button>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <footer className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)] no-print">
        BiteSized · <Link href="/about" className="hover:text-[var(--foreground)]">About</Link> · <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link> · <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link> · <a href="#" className="hover:text-[var(--foreground)]">Contact</a>
      </footer>
    </div>
  );
}
