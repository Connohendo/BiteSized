"use client";

import { useState, useCallback, useRef } from "react";
import type { ProcessResult, ProcessOptions } from "@/lib/types";

const ACCEPT = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp";
const MAX_FILE_SIZE_MB = 10;
const FILE_EXT_REGEX = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|webp)$/i;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

function isYouTube(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be");
}

function parseInputContent(raw: string): { urls: string[]; textWithoutUrls: string } {
  const trimmed = raw.trim();
  const matches = trimmed.match(URL_REGEX) ?? [];
  const urls = matches.map((m) => m.replace(/[.,;:!?)\]\}'"]+$/, "").trim());
  const textWithoutUrls = trimmed
    .replace(URL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { urls, textWithoutUrls };
}

type InputZoneProps = {
  onProcessComplete: (result: ProcessResult) => void;
  onProcessError: (message: string) => void;
  onProcessing: (loading: boolean) => void;
};

export function InputZone({
  onProcessComplete,
  onProcessError,
  onProcessing,
}: InputZoneProps) {
  const [pasteText, setPasteText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareText1, setCompareText1] = useState("");
  const [compareText2, setCompareText2] = useState("");
  const [compareFile1, setCompareFile1] = useState<File | null>(null);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [flashcardCount, setFlashcardCount] = useState(15);
  const [template, setTemplate] = useState<ProcessOptions["template"]>("default");
  const [language, setLanguage] = useState("");
  const [summaryDetail, setSummaryDetail] = useState<ProcessOptions["summaryDetail"]>("brief");
  const [difficulty, setDifficulty] = useState<ProcessOptions["difficulty"]>("standard");

  const processInput = useCallback(async () => {
    const { urls, textWithoutUrls } = parseInputContent(pasteText);
    const articleUrl = urls.find((u) => !isYouTube(u));
    const youtubeUrl = urls.find((u) => isYouTube(u));
    const textToSend = textWithoutUrls;
    const formData = new FormData();

    if (files.length > 0) {
      files.forEach((f) => formData.append("files", f));
    }
    if (textToSend) {
      formData.append("text", textToSend);
    }
    if (articleUrl) {
      formData.append("url", articleUrl);
    }
    if (youtubeUrl) {
      formData.append("youtubeUrl", youtubeUrl);
    }

    const opts: ProcessOptions = {};
    if (flashcardCount >= 5 && flashcardCount <= 30) opts.flashcardCount = flashcardCount;
    if (template && template !== "default") opts.template = template;
    if (language.trim()) opts.language = language.trim();
    if (summaryDetail) opts.summaryDetail = summaryDetail;
    if (difficulty) opts.difficulty = difficulty;
    if (Object.keys(opts).length > 0) {
      formData.append("options", JSON.stringify(opts));
    }

    const hasInput =
      files.length > 0 || textToSend || articleUrl !== undefined || youtubeUrl !== undefined;
    if (!hasInput) {
      onProcessError("Please paste text, add a URL, or upload at least one file.");
      return;
    }

    onProcessing(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        onProcessError(data.error ?? "Processing failed.");
        return;
      }
      onProcessComplete({
        text: data.text ?? "",
        summary: data.summary ?? "",
        bullets: Array.isArray(data.bullets) ? data.bullets : [],
        flashcards: Array.isArray(data.flashcards) ? data.flashcards : [],
        keyTerms: Array.isArray(data.keyTerms) ? data.keyTerms : [],
        quiz: Array.isArray(data.quiz) ? data.quiz : [],
        outline: Array.isArray(data.outline) ? data.outline : [],
        mindMap: typeof data.mindMap === "string" ? data.mindMap : "",
      });
    } catch (e) {
      onProcessError(
        e instanceof Error ? e.message : "Network or server error."
      );
    } finally {
      onProcessing(false);
    }
  }, [pasteText, files, flashcardCount, template, language, summaryDetail, difficulty, onProcessComplete, onProcessError, onProcessing]);

  const runCompare = useCallback(async () => {
    const formData = new FormData();
    let has1 = false;
    let has2 = false;
    if (compareFile1) {
      formData.append("file1", compareFile1);
      has1 = true;
    }
    if (compareText1.trim()) {
      formData.append("text1", compareText1.trim());
      has1 = true;
    }
    if (compareFile2) {
      formData.append("file2", compareFile2);
      has2 = true;
    }
    if (compareText2.trim()) {
      formData.append("text2", compareText2.trim());
      has2 = true;
    }
    if (!has1 || !has2) {
      onProcessError("Provide both document 1 and document 2 (text or file for each).");
      return;
    }
    onProcessing(true);
    try {
      const res = await fetch("/api/compare", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onProcessError(data.error ?? "Comparison failed.");
        return;
      }
      onProcessComplete({
        text: "",
        summary: data.summary ?? "",
        bullets: Array.isArray(data.bullets) ? data.bullets : [],
        flashcards: [],
        keyTerms: [],
        quiz: [],
        outline: [],
        mindMap: "",
      });
    } catch (e) {
      onProcessError(e instanceof Error ? e.message : "Network or server error.");
    } finally {
      onProcessing(false);
    }
  }, [compareText1, compareText2, compareFile1, compareFile2, onProcessComplete, onProcessError, onProcessing]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const list = Array.from(e.dataTransfer.files).filter((f) =>
      FILE_EXT_REGEX.test(f.name)
    );
    setFiles((prev) => [...prev, ...list].slice(0, 10));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-7">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card)] transition-colors ${
          dragActive ? "border-[var(--accent)] bg-[var(--accent)]/5" : ""
        }`}
      >
        <div className="flex items-end gap-2 p-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)] transition-colors"
            aria-label="Attach files"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              const list = (e.target.files ? Array.from(e.target.files) : []).filter(
                (f) => FILE_EXT_REGEX.test(f.name)
              );
              setFiles((prev) => [...prev, ...list].slice(0, 10));
              e.target.value = "";
            }}
          />
          <textarea
            id="paste"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste text, paste a link (article or YouTube), or attach files…"
            rows={3}
            className="flex-1 min-w-0 rounded-lg bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted)] py-2 px-0 text-sm focus:outline-none focus:ring-0 resize-none border-0"
          />
          <button
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              optionsOpen ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
            }`}
            aria-label="Generation options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={processInput}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            aria-label="Process"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        {files.length > 0 && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--foreground)]"
              >
                <span className="truncate max-w-[160px]">{f.name}</span>
                {f.size > MAX_FILE_BYTES && (
                  <span className="text-amber-500 shrink-0">Large</span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="shrink-0 text-[var(--muted)] hover:text-red-400"
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {optionsOpen && (
          <div className="px-3 pb-3 pt-3 border-t border-[var(--card-border)] grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Flashcards</label>
              <input
                type="number"
                min={5}
                max={30}
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value) || 15)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as ProcessOptions["template"])}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="default">Default</option>
                <option value="exam">Exam prep</option>
                <option value="meeting">Meeting notes</option>
                <option value="research">Research paper</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Output language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English, Spanish"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Summary</label>
              <select
                value={summaryDetail}
                onChange={(e) => setSummaryDetail(e.target.value as ProcessOptions["summaryDetail"])}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="brief">Brief</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ProcessOptions["difficulty"])}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="simple">Simple</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <button
          type="button"
          onClick={() => setCompareMode((m) => !m)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] mb-2"
        >
          {compareMode ? "▼" : "▶"} Compare two docs
        </button>
        {compareMode && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Add two documents to get a comparison summary and merged bullet points.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Document 1 (text or file)</label>
                <textarea
                  value={compareText1}
                  onChange={(e) => setCompareText1(e.target.value)}
                  placeholder="Paste text or use file below"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
                <input
                  type="file"
                  accept={ACCEPT}
                  className="mt-1 text-sm text-[var(--muted)]"
                  onChange={(e) => setCompareFile1(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Document 2 (text or file)</label>
                <textarea
                  value={compareText2}
                  onChange={(e) => setCompareText2(e.target.value)}
                  placeholder="Paste text or use file below"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
                <input
                  type="file"
                  accept={ACCEPT}
                  className="mt-1 text-sm text-[var(--muted)]"
                  onChange={(e) => setCompareFile2(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={runCompare}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
            >
              Compare
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={processInput}
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
      >
        Process
      </button>
    </div>
  );
}
