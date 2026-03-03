"use client";

import { useCallback, useState } from "react";
import { toAnkiCsv } from "@/lib/export/anki";
import { toMarkdown } from "@/lib/export/markdown";
import type { ProcessResult } from "@/lib/types";

type ExportBarProps = {
  result: ProcessResult;
};

export function ExportBar({ result }: ExportBarProps) {
  const [markdownCopied, setMarkdownCopied] = useState(false);

  const handleDownloadAnki = useCallback(() => {
    const csv = toAnkiCsv(result.flashcards);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitesized-flashcards.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [result.flashcards]);

  const handleCopyMarkdown = useCallback(async () => {
    const md = toMarkdown(result);
    await navigator.clipboard.writeText(md);
    setMarkdownCopied(true);
    setTimeout(() => setMarkdownCopied(false), 2000);
  }, [result]);

  const handleDownloadMarkdown = useCallback(() => {
    const md = toMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitesized-study-pack.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const hasFlashcards = result.flashcards?.length > 0;
  const hasQuiz = (result.quiz?.length ?? 0) > 0;
  const hasContent =
    result.summary ||
    (result.bullets?.length ?? 0) > 0 ||
    (result.keyTerms?.length ?? 0) > 0 ||
    hasFlashcards ||
    hasQuiz;

  if (!hasContent) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <span className="text-sm font-medium text-[var(--foreground)] mr-2">
        Export
      </span>
      {hasFlashcards && (
        <button
          type="button"
          onClick={handleDownloadAnki}
          className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5"
        >
          Download Anki CSV
        </button>
      )}
      <button
        type="button"
        onClick={handleCopyMarkdown}
        className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5"
      >
        {markdownCopied ? "Copied!" : "Copy as Markdown"}
      </button>
      <button
        type="button"
        onClick={handleDownloadMarkdown}
        className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5"
      >
        Download Markdown
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
