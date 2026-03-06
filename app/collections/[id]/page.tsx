"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getCollection,
  updateCollection,
  deleteCollection,
  addPackToCollection,
  removePackFromCollection,
  updatePackDisplayName,
} from "@/lib/collections";
import { getHistory, getHistoryItem } from "@/lib/history";
import { serializeCollection } from "@/lib/share";
import { useToast } from "@/components/Toast";
import type { Collection as CollectionType } from "@/lib/types";
import type { HistoryItem } from "@/lib/types";

function safeFilename(name: string): string {
  const base = name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || "collection";
  return `${base}.bitesized-collection.json`;
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

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = typeof params.id === "string" ? params.id : "";
  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [editPackNameValue, setEditPackNameValue] = useState("");

  const refresh = () => {
    const c = getCollection(id);
    setCollection(c);
    if (c) setEditNameValue(c.name);
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    refresh();
  }, [id]);

  if (!id) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <p className="text-[var(--muted)]">Invalid collection.</p>
        <Link href="/collections" className="text-[var(--accent)] hover:underline mt-2 inline-block">
          ← Collections
        </Link>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <p className="text-[var(--muted)]">Collection not found.</p>
        <Link href="/collections" className="text-[var(--accent)] hover:underline mt-2 inline-block">
          ← Collections
        </Link>
      </div>
    );
  }

  const handleRename = () => {
    const trimmed = editNameValue.trim().slice(0, 100);
    if (trimmed && trimmed !== collection.name) {
      updateCollection(id, { name: trimmed });
      setCollection({ ...collection, name: trimmed });
    }
    setEditingName(false);
  };

  const handleDeleteCollection = () => {
    if (typeof window !== "undefined" && window.confirm(`Delete "${collection.name}"?`)) {
      deleteCollection(id);
      router.push("/collections");
    }
  };

  const handleRemovePack = (e: React.MouseEvent, packId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removePackFromCollection(id, packId);
    refresh();
  };

  const handleAddPack = (historyItemId: string) => {
    addPackToCollection(id, historyItemId);
    refresh();
    setAddModalOpen(false);
  };

  const getPackTitle = (packId: string, displayName?: string) => {
    if (displayName?.trim()) return displayName.trim();
    const item = getHistoryItem(packId);
    return item?.title ?? "Removed from history";
  };

  const startEditingPack = (packId: string, currentTitle: string) => {
    setEditingPackId(packId);
    setEditPackNameValue(currentTitle);
  };

  const finishEditingPack = (packId: string) => {
    const trimmed = editPackNameValue.trim().slice(0, 100) || null;
    updatePackDisplayName(id, packId, trimmed);
    setEditingPackId(null);
    setEditPackNameValue("");
    refresh();
  };

  const cancelEditingPack = () => {
    setEditingPackId(null);
    setEditPackNameValue("");
  };

  const availableToAdd = historyItems.filter(
    (item) => !collection.packs.some((p) => p.id === item.id)
  );

  const resolvedPacks = collection.packs.map((entry) => {
    const item = getHistoryItem(entry.id);
    return { packId: entry.id, displayName: entry.displayName, item };
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">
          <Link
            href="/collections"
            className="hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
          >
            ← Collections
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {editingName ? (
            <>
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setEditNameValue(collection.name);
                    setEditingName(false);
                  }
                }}
                className="text-2xl font-semibold text-[var(--foreground)] bg-transparent border-b border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] px-0 py-1 min-w-[200px]"
                autoFocus
                maxLength={100}
              />
            </>
          ) : (
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              {collection.name}
            </h1>
          )}
          {!editingName && (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
            >
              Rename
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          Add from history
        </button>
        <button
          type="button"
          onClick={() => {
            const json = serializeCollection(collection, getHistoryItem);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = safeFilename(collection.name);
            a.click();
            URL.revokeObjectURL(url);
            showToast("Collection saved");
          }}
          className="px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          Export collection
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(serializeCollection(collection, getHistoryItem));
              showToast("Copied to clipboard");
            } catch {
              showToast("Copy failed");
            }
          }}
          className="px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          Copy collection
        </button>
        <button
          type="button"
          onClick={handleDeleteCollection}
          className="px-4 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
        >
          Delete collection
        </button>
      </div>

      {resolvedPacks.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No study packs in this collection. Add some from History.
        </div>
      ) : (
        <ul className="space-y-2">
          {resolvedPacks.map(({ packId, displayName, item }) => {
            const title = getPackTitle(packId, displayName);
            const isEditing = editingPackId === packId;
            return (
              <li key={packId}>
                {item ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPackNameValue}
                          onChange={(e) => setEditPackNameValue(e.target.value)}
                          onBlur={() => finishEditingPack(packId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") finishEditingPack(packId);
                            if (e.key === "Escape") cancelEditingPack();
                          }}
                          className="w-full text-[var(--foreground)] bg-transparent border-b border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] px-0 py-1 truncate"
                          autoFocus
                          maxLength={100}
                        />
                      ) : (
                        <Link href={`/?history=${encodeURIComponent(packId)}`}>
                          <p className="text-[var(--foreground)] truncate">
                            {title}
                          </p>
                          <p className="text-sm text-[var(--muted)] mt-0.5">
                            {formatDate(item.createdAt)}
                          </p>
                        </Link>
                      )}
                    </div>
                    {!isEditing && (
                      <span
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => startEditingPack(packId, title)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          aria-label="Rename pack"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemovePack(e, packId)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-red-400 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          aria-label="Remove from collection"
                        >
                          Remove from collection
                        </button>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-[var(--muted)]">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPackNameValue}
                          onChange={(e) => setEditPackNameValue(e.target.value)}
                          onBlur={() => finishEditingPack(packId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") finishEditingPack(packId);
                            if (e.key === "Escape") cancelEditingPack();
                          }}
                          className="w-full text-[var(--foreground)] bg-transparent border-b border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] px-0 py-1 text-sm"
                          autoFocus
                          maxLength={100}
                        />
                      ) : (
                        <span className="text-sm">{title}</span>
                      )}
                    </div>
                    {!isEditing && (
                      <span
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => startEditingPack(packId, title)}
                          className="rounded-lg px-2 py-1 text-sm hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemovePack(e, packId)}
                          className="rounded-lg px-2 py-1 text-sm hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                          Remove
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {addModalOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/50"
            role="button"
            tabIndex={-1}
            onClick={() => setAddModalOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setAddModalOpen(false)}
            aria-label="Close"
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl p-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Add from history
            </h2>
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4">
                All history items are already in this collection, or history is
                empty.
              </p>
            ) : (
              <ul className="overflow-y-auto space-y-1 flex-1 min-h-0">
                {availableToAdd.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleAddPack(item.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <span className="truncate block">{item.title}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {formatDate(item.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="mt-3 px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              Close
            </button>
          </div>
        </>
      )}

      <footer className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)] no-print">
        BiteSized · <Link href="/about" className="hover:text-[var(--foreground)]">About</Link> · <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link> · <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link> · <a href="#" className="hover:text-[var(--foreground)]">Contact</a>
      </footer>
    </div>
  );
}
