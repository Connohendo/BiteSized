import type { ProcessResult, OutlineNode } from "@/lib/types";

function outlineToMarkdown(nodes: OutlineNode[], indent = 0): string {
  const prefix = "  ".repeat(indent);
  return nodes
    .map((n) => {
      const line = prefix + "- " + n.title.trim();
      const childLines = n.children?.length ? outlineToMarkdown(n.children, indent + 1) : "";
      return childLines ? line + "\n" + childLines : line;
    })
    .join("\n");
}

export function toMarkdown(result: ProcessResult): string {
  const sections: string[] = [];

  if (result.summary) {
    sections.push("## Summary\n\n" + result.summary.trim());
  }

  if (result.bullets?.length) {
    sections.push(
      "## Key points\n\n" +
        result.bullets.map((b) => "- " + b.trim()).join("\n")
    );
  }

  if (result.keyTerms?.length) {
    sections.push(
      "## Key terms\n\n" +
        result.keyTerms
          .map((k) => `- **${k.term}**: ${k.definition.trim()}`)
          .join("\n")
    );
  }

  if (result.flashcards?.length) {
    sections.push(
      "## Flashcards\n\n" +
        result.flashcards
          .map((c) => `- **Q:** ${c.front}\n  **A:** ${c.back}`)
          .join("\n\n")
    );
  }

  if (result.quiz?.length) {
    sections.push(
      "## Quiz\n\n" +
        result.quiz
          .map(
            (q, i) =>
              `${i + 1}. ${q.question}\n` +
              q.options
                .map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`)
                .join("\n") +
              `\n   **Answer:** ${q.options[q.correctIndex]}`
          )
          .join("\n\n")
    );
  }

  if (result.outline?.length) {
    sections.push("## Outline\n\n" + outlineToMarkdown(result.outline));
  }

  if (result.mindMap?.trim()) {
    sections.push("## Mind map\n\n```mermaid\n" + result.mindMap.trim() + "\n```");
  }

  return sections.join("\n\n---\n\n");
}
