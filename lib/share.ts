import type { Collection, HistoryItem } from "./types";
import { addToHistory } from "./history";
import { createCollection, updateCollection } from "./collections";

const SHARE_VERSION = 1;

export type PackSharePayload = {
  version: number;
  type: "pack";
  pack: HistoryItem;
};

export type CollectionPackExport = HistoryItem & { displayName?: string };

export type CollectionSharePayload = {
  version: number;
  type: "collection";
  name: string;
  packs: CollectionPackExport[];
};

export type SharePayload = PackSharePayload | CollectionSharePayload;

function isHistoryItemLike(obj: unknown): obj is HistoryItem {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.result === "object" &&
    o.result !== null
  );
}

function isPackPayload(obj: unknown): obj is PackSharePayload {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    o.version === SHARE_VERSION &&
    o.type === "pack" &&
    isHistoryItemLike(o.pack)
  );
}

function isCollectionPayload(obj: unknown): obj is CollectionSharePayload {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (o.version !== SHARE_VERSION || o.type !== "collection") return false;
  if (typeof o.name !== "string") return false;
  if (!Array.isArray(o.packs)) return false;
  return o.packs.every((p: unknown) => isHistoryItemLike(p));
}

export function serializePack(item: HistoryItem): string {
  const payload: PackSharePayload = {
    version: SHARE_VERSION,
    type: "pack",
    pack: item,
  };
  return JSON.stringify(payload);
}

export function serializeCollection(
  collection: Collection,
  getHistoryItem: (id: string) => HistoryItem | null
): string {
  const packs: CollectionPackExport[] = [];
  for (const entry of collection.packs) {
    const item = getHistoryItem(entry.id);
    if (!item) continue;
    packs.push({
      ...item,
      displayName: entry.displayName,
    });
  }
  const payload: CollectionSharePayload = {
    version: SHARE_VERSION,
    type: "collection",
    name: collection.name,
    packs,
  };
  return JSON.stringify(payload);
}

export function parseSharePayload(json: string): SharePayload | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (isPackPayload(parsed)) return parsed;
    if (isCollectionPayload(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function importPack(payload: PackSharePayload): HistoryItem {
  return addToHistory(payload.pack.result, payload.pack.title);
}

export function importCollection(payload: CollectionSharePayload): Collection {
  const newEntries: { id: string; displayName?: string }[] = [];
  for (const pack of payload.packs) {
    const item = addToHistory(pack.result, pack.title);
    newEntries.push({
      id: item.id,
      displayName: pack.displayName?.trim() || undefined,
    });
  }
  const collection = createCollection(payload.name);
  updateCollection(collection.id, { packs: newEntries });
  return collection;
}
