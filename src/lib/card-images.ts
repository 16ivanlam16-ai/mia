import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCards } from "./cards";

export type CardImageRecord = {
  sourceUrl: string | null;
  official: boolean;
};

const FILE = "src/data/card-images.json";

let cache: Record<string, CardImageRecord> | null = null;

export function loadCardImages(): Record<string, CardImageRecord> {
  if (cache) return cache;
  const raw = JSON.parse(readFileSync(join(process.cwd(), FILE), "utf8")) as Record<string, CardImageRecord>;
  const errors: string[] = [];
  for (const card of loadCards()) {
    if (card.status !== "published") continue;
    const record = raw[card.id];
    if (!record) {
      errors.push(`${card.id}: missing card image record`);
      continue;
    }
    if (typeof record.official !== "boolean") errors.push(`${card.id}: official must be boolean`);
    if (record.official) {
      if (typeof record.sourceUrl !== "string" || !record.sourceUrl.startsWith("https://")) {
        errors.push(`${card.id}: official image needs an https source URL`);
      }
    } else if (record.sourceUrl !== null) {
      errors.push(`${card.id}: fallback image must not invent a source URL`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  cache = raw;
  return raw;
}

export function cardImageFile(id: string): string {
  return `cards/${id}.webp`;
}
