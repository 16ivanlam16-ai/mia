import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync(dist)) {
  console.error("dist/ is missing. Run astro build first.");
  process.exit(1);
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const htmlByFile = new Map(htmlFiles.map((file) => [file, readFileSync(file, "utf8")]));

let base = "/mia/";
for (const html of htmlByFile.values()) {
  const match = html.match(/href="([^"]*favicon\.svg)"/);
  if (match && match[1].startsWith("/")) {
    base = match[1].slice(0, match[1].indexOf("favicon.svg"));
    break;
  }
}
if (!base.startsWith("/") || !base.endsWith("/")) errors.push(`could not detect base path (${base})`);

function fileForPath(pathname) {
  if (!pathname.startsWith(base)) return null;
  let rest = pathname.slice(base.length);
  if (rest.endsWith("/")) rest += "index.html";
  if (rest === "") rest = "index.html";
  return join(dist, rest);
}

const allowedExternal = (url) => url.startsWith("https://");

function classify(raw) {
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("data:")) return null;
  if (/^https?:\/\//.test(raw)) {
    const url = new URL(raw);
    if (url.origin === "https://16ivanlam16-ai.github.io") return { path: url.pathname };
    return { external: raw.split("#")[0] };
  }
  if (raw.startsWith("/")) return { path: raw.split("?")[0].split("#")[0] };
  return { relative: raw.split("?")[0].split("#")[0] };
}

for (const [file, html] of htmlByFile) {
  const label = file.slice(dist.length);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const found = classify(match[1]);
    if (!found) continue;
    if (found.external) {
      if (!allowedExternal(found.external)) errors.push(`${label} has unexpected external URL ${found.external}`);
      continue;
    }
    if (found.relative) {
      errors.push(`${label} has relative URL ${found.relative}`);
      continue;
    }
    const target = fileForPath(found.path);
    if (!target || !existsSync(target)) errors.push(`${label} links to missing ${found.path}`);
  }

  const isGo = html.includes('data-page="go"');
  const is404 = html.includes('data-page="404"');
  const isContent = html.includes("data-page=") && !isGo && !is404;
  if (isContent) {
    for (const token of ['hreflang="zh-Hant-HK"', 'hreflang="zh-Hans"', 'hreflang="x-default"', "<h1", 'rel="canonical"']) {
      if (!html.includes(token)) errors.push(`${label} is missing ${token}`);
    }
    if (!html.includes("https://16ivanlam16-ai.github.io/mia/")) errors.push(`${label} canonical is not on the Pages origin`);
  }
  if (isGo) {
    if (!html.includes("noindex")) errors.push(`${label} go page must be noindex`);
    if (!html.includes("affiliate_outbound") || !html.includes("mia.outboundClicks")) {
      errors.push(`${label} go page is missing click hooks`);
    }
    for (const dest of html.matchAll(/data-dest="([^"]*)"/g)) {
      if (dest[1] && !dest[1].startsWith("https://")) errors.push(`${label} destination is not https`);
    }
    if (html.includes('.get("url")') || html.includes(".get('dest')") || html.includes('.get("dest")')) {
      errors.push(`${label} reads a destination from the query string`);
    }
  }
}

const hantCompare = [...htmlByFile.entries()].find(([file]) => file.endsWith(`${join("zh-hant", "compare", "index.html")}`));
const hansCompare = [...htmlByFile.entries()].find(([file]) => file.endsWith(`${join("zh-hans", "compare", "index.html")}`));
if (!hantCompare || !hantCompare[1].includes("待補")) errors.push("Traditional compare page is missing 待補");
if (!hansCompare || !hansCompare[1].includes("待补")) errors.push("Simplified compare page is missing 待补");

const sitemap = files.filter((file) => file.includes("sitemap") && file.endsWith(".xml"));
if (sitemap.length === 0) errors.push("sitemap xml is missing");
const sitemapText = sitemap.map((file) => readFileSync(file, "utf8")).join("\n");
if (!sitemapText.includes("/zh-hant/") || !sitemapText.includes("/zh-hans/")) errors.push("sitemap is missing a locale");
if (sitemapText.includes("/go/")) errors.push("sitemap includes /go/ redirect pages");

const robots = join(dist, "robots.txt");
if (!existsSync(robots) || !readFileSync(robots, "utf8").includes("Sitemap:")) errors.push("robots.txt is missing a sitemap line");
if (!existsSync(join(dist, "favicon.svg"))) errors.push("favicon.svg was not copied");
if (!existsSync(join(dist, "og.png"))) errors.push("og.png is missing");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`dist checks passed (${htmlFiles.length} html files, base ${base})`);
