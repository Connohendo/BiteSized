"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCollections,
  createCollection,
  deleteCollection,
} from "@/lib/collections";
import type { Collection } from "@/lib/types";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = () => setCollections(getCollections());

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    createCollection(name);
    setNewName("");
    setCreating(false);
    refresh();
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined" && window.confirm(`Delete "${name}"?`)) {
      deleteCollection(id);
      refresh();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">
          <Link
            href="/"
            className="hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
          >
            ← Dashboard
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Collections
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Group study packs by topic or project.
        </p>
      </div>

      <div className="mb-6">
        {creating ? (
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
              maxLength={100}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
              className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          >
            New collection
          </button>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No collections yet. Create one and add study packs from the Dashboard
          or History.
        </div>
      ) : (
        <ul className="space-y-2">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/collections/${encodeURIComponent(c.id)}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--foreground)] truncate font-medium">
                    {c.name}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {c.packs.length} pack{c.packs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, c.id, c.name)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-red-400 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  aria-label={`Delete ${c.name}`}
                >
                  Delete
                </button>
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
