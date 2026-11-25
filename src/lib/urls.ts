const TOKEN = /^[A-Za-z0-9_-]{1,80}$/;

export function joinBase(baseUrl: string, ...parts: string[]): string {
  let base = baseUrl || "/";
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  const rest = parts
    .flatMap((part) => part.split("/"))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && segment !== "." && segment !== "..");
  return rest.length === 0 ? base : `${base}${rest.join("/")}/`;
}

export function pagePath(lang: string, slug = "", base = import.meta.env.BASE_URL): string {
  return joinBase(base, lang, slug);
}

export function goPath(
  cardId: string,
  query: { channel?: string; post?: string; lang?: string },
  base = import.meta.env.BASE_URL,
): string {
  const path = joinBase(base, "go", cardId);
  const params = new URLSearchParams();
  if (query.channel && TOKEN.test(query.channel)) params.set("channel", query.channel);
  if (query.post && TOKEN.test(query.post)) params.set("post", query.post);
  if (query.lang === "zh-hant" || query.lang === "zh-hans") params.set("lang", query.lang);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export function absoluteUrl(origin: string | URL, path: string): string {
  const site = typeof origin === "string" ? origin : origin.origin;
  return new URL(path, site.endsWith("/") ? site : `${site}/`).href;
}

export function sectionOf(path: string): string {
  if (path.startsWith("cards")) return "compare";
  return path.split("/").filter(Boolean)[0] ?? "";
}
