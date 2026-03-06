import type { Collection, CollectionPackEntry } from "./types";

const STORAGE_KEY = "bitesized-collections";

function normalizePacks(item: {
  packIds?: string[];
  packs?: CollectionPackEntry[];
}): CollectionPackEntry[] {
  if (Array.isArray(item.packs)) return item.packs;
  if (Array.isArray(item.packIds)) return item.packIds.map((id) => ({ id }));
  return [];
}

function getStored(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { name?: unknown }).name === "string" &&
          typeof (item as { createdAt?: unknown }).createdAt === "number" &&
          (Array.isArray((item as { packIds?: unknown }).packIds) ||
            Array.isArray((item as { packs?: unknown }).packs))
      )
      .map((item) => {
        const packs = normalizePacks(item as { packIds?: string[]; packs?: CollectionPackEntry[] });
        return {
          id: (item as { id: string }).id,
          name: (item as { name: string }).name,
          createdAt: (item as { createdAt: number }).createdAt,
          packs,
        } as Collection;
      });
  } catch {
    return [];
  }
}

function setStored(items: Collection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function getCollections(): Collection[] {
  const items = getStored();
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export function getCollection(id: string): Collection | null {
  return getStored().find((c) => c.id === id) ?? null;
}

export function createCollection(name: string): Collection {
  const trimmed = name.trim().slice(0, 100) || "Untitled";
  const items = getStored();
  const collection: Collection = {
    id: crypto.randomUUID(),
    name: trimmed,
    createdAt: Date.now(),
    packs: [],
  };
  items.unshift(collection);
  setStored(items);
  return collection;
}

export function updateCollection(
  id: string,
  updates: { name?: string; packs?: CollectionPackEntry[] }
): void {
  const items = getStored();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return;
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim().slice(0, 100) || "Untitled";
    items[idx] = { ...items[idx], name: trimmed };
  }
  if (updates.packs !== undefined) {
    items[idx] = { ...items[idx], packs: updates.packs };
  }
  setStored(items);
}

export function deleteCollection(id: string): void {
  setStored(getStored().filter((c) => c.id !== id));
}

export function addPackToCollection(
  collectionId: string,
  historyItemId: string
): void {
  const items = getStored();
  const idx = items.findIndex((c) => c.id === collectionId);
  if (idx === -1) return;
  const packs = items[idx].packs;
  if (packs.some((p) => p.id === historyItemId)) return;
  items[idx] = { ...items[idx], packs: [...packs, { id: historyItemId }] };
  setStored(items);
}

export function removePackFromCollection(
  collectionId: string,
  historyItemId: string
): void {
  const items = getStored();
  const idx = items.findIndex((c) => c.id === collectionId);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    packs: items[idx].packs.filter((p) => p.id !== historyItemId),
  };
  setStored(items);
}

export function updatePackDisplayName(
  collectionId: string,
  packId: string,
  displayName: string | null
): void {
  const items = getStored();
  const idx = items.findIndex((c) => c.id === collectionId);
  if (idx === -1) return;
  const packs = items[idx].packs.map((p) =>
    p.id === packId
      ? { ...p, displayName: displayName?.trim() || undefined }
      : p
  );
  items[idx] = { ...items[idx], packs };
  setStored(items);
}
