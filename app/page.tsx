"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { InputZone } from "@/components/InputZone";
import { SummaryCard } from "@/components/output/SummaryCard";
import { BulletsCard } from "@/components/output/BulletsCard";
import { KeyTermsCard } from "@/components/output/KeyTermsCard";
import { FlashcardsCard } from "@/components/output/FlashcardsCard";
import { QuizCard } from "@/components/output/QuizCard";
import { OutlineCard } from "@/components/output/OutlineCard";
import { MindMapCard } from "@/components/output/MindMapCard";
import { QAOverDoc } from "@/components/chat/QAOverDoc";
import { ExportBar } from "@/components/ExportBar";
import { addToHistory, getHistoryItem } from "@/lib/history";
import { serializePack } from "@/lib/share";
import { AddToCollectionDropdown } from "@/components/AddToCollectionDropdown";
import { useToast } from "@/components/Toast";
import { ImportModal, type ImportResult } from "@/components/ImportModal";
import type { ProcessResult } from "@/lib/types";

function safeFilename(title: string): string {
  const base = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || "pack";
  return `${base}.bitesized.json`;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [currentPackId, setCurrentPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    const historyId = searchParams.get("history");
    if (!historyId) return;
    const item = getHistoryItem(historyId);
    if (item?.result) {
      setResult({
        ...item.result,
        quiz: item.result.quiz ?? [],
        outline: item.result.outline ?? [],
        mindMap: item.result.mindMap ?? "",
      });
      setCurrentPackId(historyId);
      setError(null);
    }
  }, [searchParams]);

  const handleProcessComplete = (data: ProcessResult) => {
    const withExtras = {
      ...data,
      quiz: data.quiz ?? [],
      outline: data.outline ?? [],
      mindMap: data.mindMap ?? "",
    };
    setResult(withExtras);
    setError(null);
    const item = addToHistory(withExtras);
    setCurrentPackId(item.id);
  };

  const handleProcessError = (message: string) => {
    setError(message);
    setResult(null);
  };

  const handleProcessing = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleImported = (importResult: ImportResult) => {
    if (importResult.type === "pack") {
      showToast("Added to History");
      setResult({
        ...importResult.item.result,
        quiz: importResult.item.result.quiz ?? [],
        outline: importResult.item.result.outline ?? [],
        mindMap: importResult.item.result.mindMap ?? "",
      });
      setCurrentPackId(importResult.item.id);
      router.replace(`/?history=${encodeURIComponent(importResult.item.id)}`, { scroll: false });
    } else {
      showToast(`Collection "${importResult.collection.name}" imported with ${importResult.collection.packs.length} packs`);
      router.push(`/collections/${encodeURIComponent(importResult.collection.id)}`);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Turn any content into a study pack
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Paste text, add a link, or upload a file. Get a summary, key points, flashcards, quiz, outline, mind map, and Q&A.
        </p>
      </div>

      <div className="no-print">
        <InputZone
          onProcessComplete={handleProcessComplete}
          onProcessError={handleProcessError}
          onProcessing={handleProcessing}
        />
        <p className="mt-3 text-sm text-[var(--muted)] flex items-center gap-2 flex-wrap">
          {!result && !isLoading && (
            <>
              <span>Paste a link or upload a file to get started.</span>
              <span className="text-[var(--foreground)]">·</span>
            </>
          )}
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

      <div aria-live="polite" aria-atomic="true">
        {isLoading && (
          <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-10 no-print">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" aria-hidden />
              <p className="text-sm text-[var(--muted)]">Extracting text and generating study materials…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400 no-print flex items-start justify-between gap-4">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-red-400/50 bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {result && !isLoading && (
        <div className="mt-10 pt-8 border-t border-[var(--card-border)] print:mt-0 print:pt-0 print:border-0" id="study-pack">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
            Your study pack
          </h2>
          <div className="no-print mb-6 flex flex-wrap items-center gap-3">
            <ExportBar result={result} />
            {currentPackId && (() => {
              const item = getHistoryItem(currentPackId);
              if (!item) return <AddToCollectionDropdown historyItemId={currentPackId} />;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const json = serializePack(item);
                      const blob = new Blob([json], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = safeFilename(item.title);
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast("Pack saved");
                    }}
                    className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                  >
                    Export pack
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(serializePack(item));
                        showToast("Copied to clipboard");
                      } catch {
                        showToast("Copy failed");
                      }
                    }}
                    className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                  >
                    Copy pack
                  </button>
                  <AddToCollectionDropdown historyItemId={currentPackId} />
                </>
              );
            })()}
          </div>
          <h2 className="hidden print:block text-xl font-semibold mb-4 text-black">
            BiteSized Study Pack
          </h2>

          <section className="space-y-6 mb-8">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-3">
              Overview
            </h3>
            <div className="space-y-6">
              <SummaryCard summary={result.summary} />
              <BulletsCard bullets={result.bullets} />
            </div>
          </section>

          <section className="space-y-6 mb-8">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-3">
              Study tools
            </h3>
            <div className="space-y-6">
              <KeyTermsCard keyTerms={result.keyTerms} />
              <FlashcardsCard flashcards={result.flashcards} />
              <QuizCard questions={result.quiz ?? []} />
            </div>
          </section>

          <section className="space-y-6 mb-8">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-3">
              Structure
            </h3>
            <div className="space-y-6">
              <OutlineCard outline={result.outline ?? []} />
              <MindMapCard mindMap={result.mindMap ?? ""} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-3">
              Q&A
            </h3>
            <QAOverDoc documentText={result.text} />
          </section>
        </div>
      )}
      <footer className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)] no-print">
        BiteSized · <Link href="/about" className="hover:text-[var(--foreground)]">About</Link> · <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link> · <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link> · <a href="#" className="hover:text-[var(--foreground)]">Contact</a>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Dashboard
            </h1>
            <p className="text-[var(--muted)] mt-1">Loading…</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
