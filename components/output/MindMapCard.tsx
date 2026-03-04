"use client";

import { useEffect, useRef, useState } from "react";

type MindMapCardProps = {
  mindMap: string;
};

export function MindMapCard({ mindMap }: MindMapCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mindMap?.trim() || !containerRef.current) return;

    let cancelled = false;
    setError(null);

    const el = containerRef.current;
    el.innerHTML = "";
    const pre = document.createElement("pre");
    pre.className = "mermaid";
    pre.textContent = mindMap.trim();
    el.appendChild(pre);

    import("mermaid")
      .then((mod) => {
        if (cancelled) return;
        const mermaid = mod.default;
        mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
        return mermaid.run({
          nodes: [pre],
          suppressErrors: true,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load diagram.");
      })
      .then(() => {
        if (cancelled) return;
        const svg = el.querySelector("svg");
        if (!svg && !el.querySelector(".mermaid[data-processed]")) {
          setError("Could not render diagram. The content may not be valid Mermaid.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mindMap]);

  if (!mindMap?.trim()) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-medium text-[var(--foreground)] mb-3">
        Mind map
      </h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        Main concepts and relationships from the document.
      </p>
      {error && (
        <p className="text-sm text-amber-500 mb-2">{error}</p>
      )}
      <div
        ref={containerRef}
        className="min-h-[200px] flex items-center justify-center overflow-x-auto [&_svg]:max-w-full [&_.mermaid]:flex [&_.mermaid]:justify-center"
      />
    </div>
  );
}
