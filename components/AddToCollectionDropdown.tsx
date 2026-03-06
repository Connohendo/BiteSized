"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getCollections,
  createCollection,
  addPackToCollection,
} from "@/lib/collections";
import { useToast } from "@/components/Toast";
import type { Collection } from "@/lib/types";

type AddToCollectionDropdownProps = {
  historyItemId: string;
  onAdded?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export function AddToCollectionDropdown({
  historyItemId,
  onAdded,
  className = "",
  children,
}: AddToCollectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) setCollections(getCollections());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNew(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleAdd = (collectionId: string, collectionName: string) => {
    addPackToCollection(collectionId, historyItemId);
    showToast(`Added to ${collectionName}`);
    setOpen(false);
    onAdded?.();
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim().slice(0, 100) || "Untitled";
    const c = createCollection(name);
    addPackToCollection(c.id, historyItemId);
    showToast(`Added to ${c.name}`);
    setShowNew(false);
    setNewName("");
    setOpen(false);
    onAdded?.();
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {children ?? "Add to collection"}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg py-1 z-50">
          {collections.length === 0 && !showNew ? (
            <div className="px-3 py-2 text-sm text-[var(--muted)]">
              <p className="mb-2">No collections yet.</p>
              <Link
                href="/collections"
                className="text-[var(--accent)] hover:underline"
                onClick={() => setOpen(false)}
              >
                Create a collection →
              </Link>
            </div>
          ) : showNew ? (
            <form onSubmit={handleCreateAndAdd} className="px-3 py-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-2 py-1.5 rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-2"
                autoFocus
                maxLength={100}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-2 py-1 rounded bg-[var(--accent)] text-white text-sm"
                >
                  Create & add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setNewName("");
                  }}
                  className="px-2 py-1 rounded border border-[var(--card-border)] text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleAdd(c.id, c.name)}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-inset"
                >
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="w-full text-left px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5 border-t border-[var(--card-border)] mt-1 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-inset"
              >
                + New collection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
