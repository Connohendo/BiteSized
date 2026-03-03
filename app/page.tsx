"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InputZone } from "@/components/InputZone";
import { SummaryCard } from "@/components/output/SummaryCard";
import { BulletsCard } from "@/components/output/BulletsCard";
import { KeyTermsCard } from "@/components/output/KeyTermsCard";
import { FlashcardsCard } from "@/components/output/FlashcardsCard";
import { QuizCard } from "@/components/output/QuizCard";
import { ExportBar } from "@/components/ExportBar";
import { addToHistory, getHistoryItem } from "@/lib/history";
import type { ProcessResult } from "@/lib/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const historyId = searchParams.get("history");
    if (!historyId) return;
    const item = getHistoryItem(historyId);
    if (item?.result) {
      setResult({
        ...item.result,
        quiz: item.result.quiz ?? [],
      });
      setError(null);
    }
  }, [searchParams]);

  const handleProcessComplete = (data: ProcessResult) => {
    const withQuiz = { ...data, quiz: data.quiz ?? [] };
    setResult(withQuiz);
    setError(null);
    addToHistory(withQuiz);
  };

  const handleProcessError = (message: string) => {
    setError(message);
    setResult(null);
  };

  const handleProcessing = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Upload a file or paste text to get a summary, key points, flashcards, and key terms.
        </p>
      </div>

      <div className="no-print">
        <InputZone
          onProcessComplete={handleProcessComplete}
          onProcessError={handleProcessError}
          onProcessing={handleProcessing}
        />
      </div>

      {isLoading && (
        <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)] no-print">
          Extracting text and generating study materials…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400 no-print">
          {error}
        </div>
      )}

      {result && !isLoading && (
        <div className="mt-8 space-y-6 print:mt-0" id="study-pack">
          <div className="no-print">
            <ExportBar result={result} />
          </div>
          <h2 className="hidden print:block text-xl font-semibold mb-4 text-black">
            BiteSized Study Pack
          </h2>
          <SummaryCard summary={result.summary} />
          <BulletsCard bullets={result.bullets} />
          <KeyTermsCard keyTerms={result.keyTerms} />
          <FlashcardsCard flashcards={result.flashcards} />
          <QuizCard questions={result.quiz ?? []} />
        </div>
      )}
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
