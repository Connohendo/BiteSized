"use client";

import { useState, useCallback } from "react";
import type { ProcessResult, ProcessOptions } from "@/lib/types";

const ACCEPT = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp";
const MAX_FILE_SIZE_MB = 10;
const FILE_EXT_REGEX = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|webp)$/i;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const [articleUrl, setArticleUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
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
    let textToSend = pasteText.trim();
    const formData = new FormData();

    if (files.length > 0) {
      files.forEach((f) => formData.append("files", f));
    }
    if (textToSend) {
      formData.append("text", textToSend);
    }
    if (articleUrl.trim()) {
      formData.append("url", articleUrl.trim());
    }
    if (youtubeUrl.trim()) {
      formData.append("youtubeUrl", youtubeUrl.trim());
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
      files.length > 0 ||
      textToSend ||
      articleUrl.trim() ||
      youtubeUrl.trim();
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
      });
    } catch (e) {
      onProcessError(
        e instanceof Error ? e.message : "Network or server error."
      );
    } finally {
      onProcessing(false);
    }
  }, [pasteText, articleUrl, youtubeUrl, files, flashcardCount, template, language, summaryDetail, difficulty, onProcessComplete, onProcessError, onProcessing]);

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

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center transition-colors ${
          dragActive ? "border-[var(--accent)] bg-[var(--accent)]/5" : ""
        }`}
      >
        <p className="text-[var(--muted)] mb-4">
          Drag and drop PDF, DOCX, TXT, or images (JPG, PNG, GIF, WebP) here, or click to choose files
        </p>
        <input
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          id="file-upload"
          onChange={(e) => {
            const list = (e.target.files ? Array.from(e.target.files) : []).filter(
              (f) => FILE_EXT_REGEX.test(f.name)
            );
            setFiles((prev) => [...prev, ...list].slice(0, 10));
            e.target.value = "";
          }}
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-4 py-2 rounded-lg bg-[var(--accent)] text-white cursor-pointer hover:opacity-90 transition-opacity"
        >
          Choose files
        </label>
        {files.length > 0 && (
          <ul className="mt-4 text-left space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between text-sm text-[var(--foreground)]"
              >
                <span className="truncate max-w-[280px]">{f.name}</span>
                {f.size > MAX_FILE_BYTES && (
                  <span className="text-amber-500 text-xs">
                    Over {MAX_FILE_SIZE_MB}MB
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-[var(--muted)] hover:text-red-400 ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-4">
        <div>
          <label htmlFor="article-url" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Article URL
          </label>
          <input
            id="article-url"
            type="url"
            value={articleUrl}
            onChange={(e) => setArticleUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            YouTube video URL
          </label>
          <input
            id="youtube-url"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="paste" className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Or paste text below
          </label>
          <textarea
          id="paste"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your content here…"
          rows={6}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        </div>
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

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <button
          type="button"
          onClick={() => setOptionsOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
        >
          {optionsOpen ? "▼" : "▶"} Generation options
        </button>
        {optionsOpen && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
