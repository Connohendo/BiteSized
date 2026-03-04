"use client";

import { useEffect, useRef, useState } from "react";
import { CollapseChevron } from "@/components/CollapseChevron";

type MindMapCardProps = {
  mindMap: string;
  defaultExpanded?: boolean;
};

export function MindMapCard({ mindMap, defaultExpanded = false }: MindMapCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
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
  }, [mindMap, expanded]);

  if (!mindMap?.trim()) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 mb-4 rounded text-left text-[var(--foreground)] hover:opacity-80 transition-opacity w-full"
        aria-expanded={expanded}
      >
        <CollapseChevron expanded={expanded} className="text-[var(--muted)]" />
        <h2 className="text-lg font-medium">
          Mind map
        </h2>
      </button>
      {expanded && (
        <>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
            Main concepts and relationships from the document.
          </p>
          {error && (
            <p className="text-sm text-amber-500 mb-2">{error}</p>
          )}
          <div
            ref={containerRef}
            className="min-h-[420px] flex items-center justify-center overflow-auto [&_svg]:max-w-none [&_svg]:min-w-[600px] [&_.mermaid]:flex [&_.mermaid]:justify-center"
          />
        </>
      )}
    </div>
  );
}
