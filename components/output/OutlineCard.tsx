"use client";

import { useState } from "react";
import { CollapseChevron } from "@/components/CollapseChevron";
import type { OutlineNode } from "@/lib/types";

type OutlineCardProps = {
  outline: OutlineNode[];
  defaultExpanded?: boolean;
};

function OutlineNodeItem({ node, depth = 0 }: { node: OutlineNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-0">
      <div
        className="flex items-center gap-2 py-1.5 text-sm text-[var(--foreground)]"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[var(--muted)] hover:bg-white/5"
            aria-expanded={open}
          >
            {open ? "▼" : "▶"}
          </button>
        ) : (
          <span className="shrink-0 w-5 inline-block" aria-hidden />
        )}
        <span>{node.title}</span>
      </div>
      {hasChildren && open && (
        <div>
          {node.children!.map((child, i) => (
            <OutlineNodeItem key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OutlineCard({ outline, defaultExpanded = false }: OutlineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!outline?.length) return null;

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
          Outline
        </h2>
      </button>
      {expanded && (
        <>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
            Hierarchical outline of the document. Expand or collapse sections.
          </p>
          <div className="space-y-0">
            {outline.map((node, i) => (
              <OutlineNodeItem key={i} node={node} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
