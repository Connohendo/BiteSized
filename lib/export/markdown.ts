import type { ProcessResult } from "@/lib/types";

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

  return sections.join("\n\n---\n\n");
}
