import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assertHeaders, rowsFromCsv } from "./csv";
import type { Lang } from "./taxonomy";
import {
  AUDIENCES,
  CARD_STATUSES,
  INCOME_PERIODS,
  NETWORKS,
  REWARD_TYPES,
  type Audience,
  type CardStatus,
  type IncomePeriod,
  type Network,
  type RewardType,
} from "./taxonomy";

export const CARD_COLUMNS = [
  "id",
  "status",
  "issuer_code",
  "issuer_name_zh_hant",
  "issuer_name_zh_hans",
  "product_name_zh_hant",
  "product_name_zh_hans",
  "network",
  "audiences",
  "reward_type",
  "annual_fee_hkd",
  "annual_fee_waiver_zh_hant",
  "annual_fee_waiver_zh_hans",
  "min_income_hkd",
  "min_income_period",
  "earn_rate_zh_hant",
  "earn_rate_zh_hans",
  "welcome_offer_zh_hant",
  "welcome_offer_zh_hans",
  "interest_rate_apr",
  "foreign_txn_fee",
  "apply_url",
  "summary_zh_hant",
  "summary_zh_hans",
  "highlights_zh_hant",
  "highlights_zh_hans",
  "updated_at",
  "source_note_zh_hant",
  "source_note_zh_hans",
] as const;

export type Localized = Record<Lang, string>;

export type Card = {
  id: string;
  status: CardStatus;
  issuerCode: string;
  issuerName: Localized;
  productName: Localized;
  network: Network | null;
  audiences: Audience[];
  rewardType: RewardType | null;
  annualFeeHkd: number | null;
  annualFeeWaiver: Localized | null;
  minIncomeHkd: number | null;
  minIncomePeriod: IncomePeriod | null;
  earnRate: Localized | null;
  welcomeOffer: Localized | null;
  interestRateApr: string | null;
  foreignTxnFee: string | null;
  applyUrl: string | null;
  summary: Localized;
  highlights: Record<Lang, string[]>;
  updatedAt: string | null;
  sourceNote: Localized;
};

export type MatrixMeta = {
  version: string;
  updatedAt: string | null;
  sourceLabel: Localized;
};

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PLACEHOLDER_BRANDS = [
  "hsbc",
  "hang seng",
  "hangseng",
  "恒生",
  "恆生",
  "匯豐",
  "汇丰",
  "citi",
  "花旗",
  "中銀",
  "中银",
  "中國銀行",
  "中国银行",
  "渣打",
  "standard chartered",
  "dbs",
  "星展",
  "東亞",
  "东亚",
  "大新",
  "aeon",
  "美國運通",
  "美国运通",
  "american express",
];

let cardCache: Card[] | null = null;
let metaCache: MatrixMeta | null = null;

function isIsoDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readOptionalInt(value: string, field: string, id: string, errors: string[]): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) {
    errors.push(`${id}: ${field} must be a whole number of HKD with no currency symbol, or be blank`);
    return null;
  }
  return Number(value);
}

function localized(hant: string, hans: string, field: string, id: string, errors: string[], max: number): Localized | null {
  if (!hant && !hans) return null;
  if (!hant || !hans) {
    errors.push(`${id}: ${field} must be filled in both languages, or left blank in both`);
    return null;
  }
  if (hant.length > max || hans.length > max) {
    errors.push(`${id}: ${field} is longer than ${max} characters`);
  }
  return { "zh-hant": hant, "zh-hans": hans };
}

function requireLocalized(hant: string, hans: string, field: string, id: string, errors: string[], max: number): Localized {
  const value = localized(hant, hans, field, id, errors, max);
  if (!value) errors.push(`${id}: ${field} is required in both languages`);
  return value ?? { "zh-hant": hant, "zh-hans": hans };
}

function splitList(value: string): string[] {
  if (!value) return [];
  return value.split("|").map((item) => item.trim()).filter(Boolean);
}

function includesBrand(text: string): string | null {
  const haystack = text.toLowerCase();
  return PLACEHOLDER_BRANDS.find((brand) => haystack.includes(brand.toLowerCase())) ?? null;
}

export function loadMatrixMeta(): MatrixMeta {
  if (metaCache) return metaCache;
  const file = join(process.cwd(), "src/data/matrix-meta.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const allowed = new Set(["version", "updatedAt", "sourceLabel"]);
  const errors: string[] = [];
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) errors.push(`matrix-meta.json has unexpected key ${key}`);
  }
  const version = typeof raw.version === "string" ? raw.version.trim() : "";
  if (!version || version.length > 40 || /[\r\n]/.test(version)) errors.push("matrix version must be a single short label");
  const updatedAt = raw.updatedAt;
  if (updatedAt !== null && (typeof updatedAt !== "string" || !isIsoDate(updatedAt))) {
    errors.push("matrix updatedAt must be null or an ISO date");
  }
  const label = raw.sourceLabel as Partial<Localized> | undefined;
  if (!label || !label["zh-hant"] || !label["zh-hans"]) {
    errors.push("matrix sourceLabel needs both zh-hant and zh-hans");
  }
  if (errors.length) throw new Error(errors.join("\n"));
  metaCache = {
    version,
    updatedAt: typeof updatedAt === "string" ? updatedAt : null,
    sourceLabel: { "zh-hant": label?.["zh-hant"] ?? "", "zh-hans": label?.["zh-hans"] ?? "" },
  };
  return metaCache;
}

export function loadCards(): Card[] {
  if (cardCache) return cardCache;
  const fileName = "src/data/cards.csv";
  const text = readFileSync(join(process.cwd(), fileName), "utf8");
  const { headers, rows } = rowsFromCsv(text);
  assertHeaders(headers, CARD_COLUMNS, fileName);
  const errors: string[] = [];
  const seen = new Set<string>();
  const cards: Card[] = [];

  for (const row of rows) {
    const id = row.id;
    if (!ID_PATTERN.test(id) || id.length > 60) errors.push(`${id || "(blank)"}: id must be a lowercase slug`);
    if (seen.has(id)) errors.push(`${id}: duplicated card id`);
    seen.add(id);

    const status = row.status;
    if (!CARD_STATUSES.includes(status as CardStatus)) errors.push(`${id}: status must be placeholder or published`);

    if (!ID_PATTERN.test(row.issuer_code)) errors.push(`${id}: issuer_code must be a lowercase slug`);

    const issuerName = requireLocalized(row.issuer_name_zh_hant, row.issuer_name_zh_hans, "issuer name", id, errors, 80);
    const productName = requireLocalized(row.product_name_zh_hant, row.product_name_zh_hans, "product name", id, errors, 80);
    const summary = requireLocalized(row.summary_zh_hant, row.summary_zh_hans, "summary", id, errors, 280);
    const sourceNote = requireLocalized(row.source_note_zh_hant, row.source_note_zh_hans, "source note", id, errors, 160);

    let network: Network | null = null;
    if (row.network) {
      if (!NETWORKS.includes(row.network as Network)) errors.push(`${id}: unknown network ${row.network}`);
      else network = row.network as Network;
    }

    let rewardType: RewardType | null = null;
    if (row.reward_type) {
      if (!REWARD_TYPES.includes(row.reward_type as RewardType)) errors.push(`${id}: unknown reward_type ${row.reward_type}`);
      else rewardType = row.reward_type as RewardType;
    }

    const audiences: Audience[] = [];
    for (const token of splitList(row.audiences)) {
      if (!AUDIENCES.includes(token as Audience)) errors.push(`${id}: unknown audience ${token}`);
      else audiences.push(token as Audience);
    }
    if (audiences.length === 0) errors.push(`${id}: at least one audience tag is required`);

    const annualFeeHkd = readOptionalInt(row.annual_fee_hkd, "annual_fee_hkd", id, errors);
    const minIncomeHkd = readOptionalInt(row.min_income_hkd, "min_income_hkd", id, errors);
    let minIncomePeriod: IncomePeriod | null = null;
    if (row.min_income_period) {
      if (!INCOME_PERIODS.includes(row.min_income_period as IncomePeriod)) {
        errors.push(`${id}: min_income_period must be monthly, annual, or blank`);
      } else minIncomePeriod = row.min_income_period as IncomePeriod;
    }
    if (minIncomePeriod && minIncomeHkd === null) errors.push(`${id}: min_income_period is set without min_income_hkd`);

    const annualFeeWaiver = localized(row.annual_fee_waiver_zh_hant, row.annual_fee_waiver_zh_hans, "annual fee waiver", id, errors, 160);
    const earnRate = localized(row.earn_rate_zh_hant, row.earn_rate_zh_hans, "earn rate", id, errors, 160);
    const welcomeOffer = localized(row.welcome_offer_zh_hant, row.welcome_offer_zh_hans, "welcome offer", id, errors, 240);

    let interestRateApr: string | null = null;
    if (row.interest_rate_apr) {
      if (row.interest_rate_apr.length > 80) errors.push(`${id}: interest_rate_apr is too long`);
      interestRateApr = row.interest_rate_apr;
    }
    let foreignTxnFee: string | null = null;
    if (row.foreign_txn_fee) {
      if (row.foreign_txn_fee.length > 80) errors.push(`${id}: foreign_txn_fee is too long`);
      foreignTxnFee = row.foreign_txn_fee;
    }

    let applyUrl: string | null = null;
    if (row.apply_url) {
      try {
        const url = new URL(row.apply_url);
        if (url.protocol !== "https:") errors.push(`${id}: apply_url must be an https URL`);
        else applyUrl = url.href;
      } catch {
        errors.push(`${id}: apply_url is not a URL`);
      }
    }

    let updatedAt: string | null = null;
    if (row.updated_at) {
      if (!isIsoDate(row.updated_at)) errors.push(`${id}: updated_at must be YYYY-MM-DD or blank`);
      else updatedAt = row.updated_at;
    }

    const highlightsHant = splitList(row.highlights_zh_hant);
    const highlightsHans = splitList(row.highlights_zh_hans);
    if (highlightsHant.length !== highlightsHans.length) errors.push(`${id}: highlights must have the same number of items in both languages`);
    if (highlightsHant.length > 6) errors.push(`${id}: no more than 6 highlights`);
    for (const item of [...highlightsHant, ...highlightsHans]) {
      if (item.length > 80) errors.push(`${id}: a highlight is longer than 80 characters`);
    }

    const commercialFilled = [
      annualFeeHkd !== null,
      annualFeeWaiver !== null,
      minIncomeHkd !== null,
      minIncomePeriod !== null,
      earnRate !== null,
      welcomeOffer !== null,
      interestRateApr !== null,
      foreignTxnFee !== null,
      applyUrl !== null,
      updatedAt !== null,
    ].some(Boolean);

    const nameBlob = `${issuerName["zh-hant"]} ${productName["zh-hant"]} ${issuerName["zh-hans"]} ${productName["zh-hans"]}`;
    if (status === "placeholder") {
      if (commercialFilled) {
        errors.push(`${id}: placeholder rows must leave fees, rates, income, welcome text, apply URL, and updated_at blank`);
      }
      const prose = [
        summary["zh-hant"],
        summary["zh-hans"],
        sourceNote["zh-hant"],
        sourceNote["zh-hans"],
        ...highlightsHant,
        ...highlightsHans,
      ].join("\n");
      if (/HK\$|%|\d/.test(prose)) {
        errors.push(`${id}: placeholder copy must not contain amounts, percents, or digits`);
      }
      if (!productName["zh-hant"].includes("樣本") && !productName["zh-hant"].includes("範例")) {
        errors.push(`${id}: placeholder Traditional name must say it is a 樣本`);
      }
      if (!productName["zh-hans"].includes("样本") && !productName["zh-hans"].includes("示例")) {
        errors.push(`${id}: placeholder Simplified name must say it is a 样本`);
      }
      const brand = includesBrand(nameBlob);
      if (brand) errors.push(`${id}: placeholder row names a real brand (${brand}). Keep samples unnamed until status is published.`);
    }

    if (status === "published") {
      if (!updatedAt) errors.push(`${id}: published rows need updated_at`);
      if (!commercialFilled) errors.push(`${id}: published rows need at least one term or an apply URL`);
      if (/範例|示例|樣本|样本/.test(nameBlob)) errors.push(`${id}: published rows should not still be named as samples`);
    }

    cards.push({
      id,
      status: (CARD_STATUSES.includes(status as CardStatus) ? status : "placeholder") as CardStatus,
      issuerCode: row.issuer_code,
      issuerName,
      productName,
      network,
      audiences,
      rewardType,
      annualFeeHkd,
      annualFeeWaiver,
      minIncomeHkd,
      minIncomePeriod,
      earnRate,
      welcomeOffer,
      interestRateApr,
      foreignTxnFee,
      applyUrl,
      summary,
      highlights: { "zh-hant": highlightsHant, "zh-hans": highlightsHans },
      updatedAt,
      sourceNote,
    });
  }

  if (cards.length === 0) errors.push("cards.csv has no rows");
  if (errors.length) throw new Error(`Card matrix is invalid:\n- ${errors.join("\n- ")}`);
  cardCache = cards;
  return cards;
}

export function cardById(id: string): Card | undefined {
  return loadCards().find((card) => card.id === id);
}
