"use client";

import { useState, useCallback } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  if (!text) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        "rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)] transition-colors " +
        className
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
