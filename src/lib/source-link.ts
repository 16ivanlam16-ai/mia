export type SourcePart =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string };

const URL_IN_NOTE = /[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]*)?/gi;

export function sourceParts(note: string): SourcePart[] {
  const parts: SourcePart[] = [];
  let cursor = 0;
  for (const match of note.matchAll(URL_IN_NOTE)) {
    const text = match[0];
    const index = match.index ?? 0;
    if (!text.includes(".")) continue;
    if (index > cursor) parts.push({ kind: "text", text: note.slice(cursor, index) });
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    parts.push({ kind: "link", text, href });
    cursor = index + text.length;
  }
  if (cursor < note.length) parts.push({ kind: "text", text: note.slice(cursor) });
  return parts;
}
