"use client";

import { useState, useRef } from "react";
import {
  parseSharePayload,
  importPack,
  importCollection,
  type SharePayload,
} from "@/lib/share";
import type { HistoryItem } from "@/lib/types";
import type { Collection } from "@/lib/types";

export type ImportResult =
  | { type: "pack"; item: HistoryItem }
  | { type: "collection"; collection: Collection };

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImported: (result: ImportResult) => void;
};

export function ImportModal({
  isOpen,
  onClose,
  onImported,
}: ImportModalProps) {
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processJson = (json: string): ImportResult | null => {
    const payload = parseSharePayload(json);
    if (!payload) return null;
    if (payload.type === "pack") {
      const item = importPack(payload);
      return { type: "pack", item };
    }
    const collection = importCollection(payload);
    return { type: "collection", collection };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString();
      if (!text) {
        setError("Could not read file.");
        return;
      }
      const result = processJson(text);
      if (result) {
        onImported(result);
        onClose();
        setPasteValue("");
        setError(null);
        e.target.value = "";
      } else {
        setError("Invalid or unsupported BiteSized file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    setError(null);
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      setError("Paste JSON first.");
      return;
    }
    const result = processJson(trimmed);
    if (result) {
      onImported(result);
      onClose();
      setPasteValue("");
      setError(null);
    } else {
      setError("Invalid or unsupported BiteSized file.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50"
        role="button"
        tabIndex={-1}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl p-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Import pack or collection
        </h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          Upload a .json file or paste exported BiteSized JSON below.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="sr-only"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-3 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          Choose file
        </button>
        <p className="text-xs text-[var(--muted)] mb-1">Or paste JSON</p>
        <textarea
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          placeholder='{"version":1,"type":"pack",...}'
          className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-y"
          spellCheck={false}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePasteImport}
            className="px-4 py-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
          >
            Import
          </button>
        </div>
      </div>
    </>
  );
}
