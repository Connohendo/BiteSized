"use client";

import { useState } from "react";
import { InputZone } from "@/components/InputZone";
import { SummaryCard } from "@/components/output/SummaryCard";
import { BulletsCard } from "@/components/output/BulletsCard";
import { KeyTermsCard } from "@/components/output/KeyTermsCard";
import { FlashcardsCard } from "@/components/output/FlashcardsCard";
import type { ProcessResult } from "@/lib/types";

export default function DashboardPage() {
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessComplete = (data: ProcessResult) => {
    setResult(data);
    setError(null);
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Upload a file or paste text to get a summary, key points, flashcards, and key terms.
        </p>
      </div>

      <InputZone
        onProcessComplete={handleProcessComplete}
        onProcessError={handleProcessError}
        onProcessing={handleProcessing}
      />

      {isLoading && (
        <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          Extracting text and generating study materials…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      )}

      {result && !isLoading && (
        <div className="mt-8 space-y-6">
          <SummaryCard summary={result.summary} />
          <BulletsCard bullets={result.bullets} />
          <KeyTermsCard keyTerms={result.keyTerms} />
          <FlashcardsCard flashcards={result.flashcards} />
        </div>
      )}
    </div>
  );
}
