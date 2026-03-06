import type { HistoryItem, ProcessResult } from "./types";

const STORAGE_KEY = "bitesized-history";
const MAX_ITEMS = 50;

function getStored(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HistoryItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as HistoryItem).id === "string" &&
        typeof (item as HistoryItem).createdAt === "number" &&
        typeof (item as HistoryItem).title === "string" &&
        typeof (item as HistoryItem).result === "object"
    );
  } catch {
    return [];
  }
}

function setStored(items: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function getHistory(): HistoryItem[] {
  const items = getStored();
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export function getHistoryItem(id: string): HistoryItem | null {
  return getStored().find((item) => item.id === id) ?? null;
}

function makeTitle(result: ProcessResult): string {
  const summary = result.summary?.trim() ?? "";
  if (summary.length > 60) return summary.slice(0, 57) + "...";
  if (summary) return summary;
  const firstBullet = result.bullets?.[0]?.trim();
  if (firstBullet && firstBullet.length > 60) return firstBullet.slice(0, 57) + "...";
  if (firstBullet) return firstBullet;
  return "Untitled";
}

export function addToHistory(
  result: ProcessResult,
  titleOverride?: string
): HistoryItem {
  const items = getStored();
  const id = crypto.randomUUID();
  const title =
    titleOverride?.trim() && titleOverride.length > 0
      ? titleOverride.trim().slice(0, 200)
      : makeTitle(result);
  const item: HistoryItem = {
    id,
    createdAt: Date.now(),
    title,
    result: { ...result },
  };
  const next = [item, ...items].slice(0, MAX_ITEMS);
  setStored(next);
  return item;
}

export function removeFromHistory(id: string): void {
  setStored(getStored().filter((item) => item.id !== id));
}
