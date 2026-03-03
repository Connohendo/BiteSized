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

  return sections.join("\n\n---\n\n");
}
