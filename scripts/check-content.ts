import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { legalDocs, legalSlugs } from "../src/content/legal";
import { guides } from "../src/content/guides";
import { zhHans } from "../src/i18n/zh-hans";
import { zhHant } from "../src/i18n/zh-hant";
import { resolveGaId, resolveGsc, resolveWebhook } from "../src/lib/analytics-policy";
import { parseCsv, rowsFromCsv, stripCsvComments } from "../src/lib/csv";
import { loadCards } from "../src/lib/cards";
import { loadClaims } from "../src/lib/claims";
import { loadMatrixMeta } from "../src/lib/cards";
import { loadProfile } from "../src/lib/profile";
import { goPath, joinBase } from "../src/lib/urls";

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) fail(`${label}: expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
}

function sameShape(a: unknown, b: unknown, path: string) {
  if (typeof a !== typeof b) {
    fail(`${path}: type ${typeof a} vs ${typeof b}`);
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      fail(`${path}: array mismatch`);
      return;
    }
    if (a.length !== b.length) fail(`${path}: length ${a.length} vs ${b.length}`);
    const count = Math.min(a.length, b.length);
    for (let index = 0; index < count; index += 1) sameShape(a[index], b[index], `${path}[${index}]`);
    return;
  }
  if (a && b && typeof a === "object") {
    const aKeys = Object.keys(a as object).sort();
    const bKeys = Object.keys(b as object).sort();
    if (aKeys.join("|") !== bKeys.join("|")) fail(`${path}: keys differ (${aKeys.join(",")} vs ${bKeys.join(",")})`);
    for (const key of aKeys) {
      if (key in (b as object)) sameShape((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`);
    }
  }
}

function assertFilled(value: unknown, path: string) {
  if (typeof value === "string") {
    if (!value.trim()) fail(`${path} is empty`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFilled(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) assertFilled(item, `${path}.${key}`);
  }
}

const quoted = stripCsvComments('# comment, with commas\nid,note\n1,"hello, world"\n2,"she said ""hi"""\n');
const parsed = parseCsv(quoted);
assertEqual(parsed.length, 3, "csv row count");
assertEqual(parsed[1][1], "hello, world", "csv comma in quotes");
assertEqual(parsed[2][1], 'she said "hi"', "csv escaped quote");
const multiline = parseCsv('id,note\n1,"line1\nline2"\n');
assertEqual(multiline[1][1], "line1\nline2", "csv multiline");
try {
  parseCsv('id\n"unterminated');
  fail("unterminated quote should throw");
} catch {
  /* expected */
}
const rows = rowsFromCsv("# c\nid,name\n a , Ada \n");
assertEqual(rows.rows[0].id, "a", "csv trim");
assertEqual(rows.rows[0].name, "Ada", "csv trim name");

assertEqual(joinBase("/mia/", "zh-hant", "compare"), "/mia/zh-hant/compare/", "join compare");
assertEqual(joinBase("/mia", "zh-hant"), "/mia/zh-hant/", "join without slash");
assertEqual(joinBase("/", "zh-hant", ""), "/zh-hant/", "join root base");
assertEqual(
  goPath("sample-cashback", { channel: "xhs", post: "demo", lang: "zh-hant" }, "/mia/"),
  "/mia/go/sample-cashback/?channel=xhs&post=demo&lang=zh-hant",
  "go path",
);
assertEqual(goPath("sample-cashback", { channel: "bad channel", post: "ok" }, "/mia/"), "/mia/go/sample-cashback/?post=ok", "go drops unsafe channel");

assertEqual(resolveGaId(""), "", "blank ga");
assertEqual(resolveGaId("G-AB12CD34"), "G-AB12CD34", "real-shaped ga");
assertEqual(resolveGaId("G-XXXXXXX"), "", "placeholder ga");
assertEqual(resolveGaId("UA-123456"), "", "universal ga");
assertEqual(resolveGsc("abc_def-1234"), "abc_def-1234", "gsc token");
assertEqual(resolveGsc("<script>"), "", "gsc injection");
assertEqual(resolveWebhook("http://example.com/hook"), "", "webhook http");
assertEqual(resolveWebhook("https://user:pass@example.com/hook"), "", "webhook credentials");
assertEqual(resolveWebhook("https://example.com/hook"), "https://example.com/hook", "webhook https");

sameShape(zhHant, zhHans, "messages");
assertFilled(zhHant, "zh-hant");
assertFilled(zhHans, "zh-hans");

for (const guide of guides) {
  if (!/^[a-z0-9-]+$/.test(guide.slug)) fail(`bad guide slug ${guide.slug}`);
  for (const section of guide.sections) {
    if (section.paragraphs["zh-hant"].length !== section.paragraphs["zh-hans"].length) {
      fail(`${guide.slug} / ${section.heading["zh-hant"]}: paragraph count differs`);
    }
  }
  assertFilled(guide, `guide:${guide.slug}`);
}
if (new Set(guides.map((guide) => guide.slug)).size !== guides.length) fail("duplicated guide slug");

for (const slug of legalSlugs) {
  const hant = legalDocs[slug]["zh-hant"];
  const hans = legalDocs[slug]["zh-hans"];
  if (hant.sections.length !== hans.sections.length) fail(`${slug}: section count differs`);
  hant.sections.forEach((section, index) => {
    if (section.paragraphs.length !== hans.sections[index].paragraphs.length) {
      fail(`${slug} section ${index}: paragraph count differs`);
    }
  });
  assertFilled(hant, `legal:${slug}:zh-hant`);
  assertFilled(hans, `legal:${slug}:zh-hans`);
}

const privacy = JSON.stringify(legalDocs.privacy);
for (const token of ["mia.outboundClicks", "affiliate_outbound", "Google Analytics", "PUBLIC_GA_MEASUREMENT_ID", "/go/"]) {
  if (!privacy.includes(token)) fail(`privacy draft is missing ${token}`);
}
const affiliate = JSON.stringify(legalDocs["affiliate-disclosure"]);
for (const token of ["channel", "post", "Creatory", "Futu"]) {
  if (!affiliate.includes(token)) fail(`affiliate draft is missing ${token}`);
}

try {
  const cards = loadCards();
  const claims = loadClaims();
  loadMatrixMeta();
  loadProfile();
  if (cards.length < 1) fail("expected sample cards");
  if (claims.length < 1) fail("expected sample claims");
  console.log(`loaded ${cards.length} cards and ${claims.length} claims`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const banned = ["最高回贈", "最高回赠", "最佳信用卡", "保證批核", "保证批核", "限時優惠", "限时优惠"];
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return path;
  });
}
for (const file of walk("src")) {
  if (!/\.(astro|ts|css|csv|json|mjs)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const phrase of banned) {
    if (text.includes(phrase)) fail(`${file} contains banned phrase ${phrase}`);
  }
  if (/innerHTML\s*=/.test(text)) fail(`${file} assigns innerHTML`);
}

const goSource = readFileSync("src/pages/go/[slug].astro", "utf8");
for (const match of goSource.matchAll(/\.get\(\s*["'](\w+)["']\s*\)/g)) {
  if (!["channel", "post", "lang"].includes(match[1])) fail(`go page reads unexpected query param ${match[1]}`);
}
if (!goSource.includes("affiliate_outbound") || !goSource.includes("mia.outboundClicks")) {
  fail("go page is missing the click-log hooks");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content checks passed");
