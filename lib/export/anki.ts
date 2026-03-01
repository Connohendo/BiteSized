/**
 * Export flashcards as CSV for Anki import.
 * Anki expects: front,back (or with semicolon/pipe depending on deck settings).
 */
export function toAnkiCsv(flashcards: { front: string; back: string }[]): string {
  const header = "front,back";
  const rows = flashcards.map(
    (c) =>
      `"${escapeCsvField(c.front)}","${escapeCsvField(c.back)}"`
  );
  return [header, ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  return value.replace(/"/g, '""').replace(/\n/g, " ");
}
