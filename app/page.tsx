"use client";

import { useState } from "react";
import { InputZone } from "@/components/InputZone";

export default function DashboardPage() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessComplete = (text: string) => {
    setExtractedText(text);
    setError(null);
  };

  const handleProcessError = (message: string) => {
    setError(message);
    setExtractedText(null);
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
          Upload a file or paste text to extract and process content.
        </p>
      </div>

      <InputZone
        onProcessComplete={handleProcessComplete}
        onProcessError={handleProcessError}
        onProcessing={handleProcessing}
      />

      {isLoading && (
        <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center text-[var(--muted)]">
          Processing…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      )}

      {extractedText !== null && !isLoading && (
        <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
            Extracted text
          </h2>
          <div className="text-[var(--foreground)] whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">
            {extractedText || "(empty)"}
          </div>
        </div>
      )}
    </div>
  );
}
