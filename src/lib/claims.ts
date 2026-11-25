import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCards } from "./cards";
import { assertHeaders, rowsFromCsv } from "./csv";
import { CLAIM_STATUSES, type ClaimStatus, type Lang } from "./taxonomy";

export const CLAIM_COLUMNS = [
  "reference",
  "submitted_at",
  "applicant_alias",
  "card_id",
  "channel",
  "post",
  "status",
  "status_history",
  "reward_note_zh_hant",
  "reward_note_zh_hans",
  "reward_amount_hkd",
  "is_sample",
] as const;

export type ClaimHistory = {
  status: ClaimStatus;
  at: string;
};

export type Claim = {
  reference: string;
  submittedAt: string;
  applicantAlias: string;
  cardId: string;
  channel: string;
  post: string;
  status: ClaimStatus;
  history: ClaimHistory[];
  rewardNote: Record<Lang, string>;
  rewardAmountHkd: number | null;
  isSample: boolean;
};

const REFERENCE = /^[A-Z0-9-]{4,40}$/;
const TOKEN = /^[A-Za-z0-9_-]{1,80}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

let cache: Claim[] | null = null;

function isIsoDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function loadClaims(): Claim[] {
  if (cache) return cache;
  const fileName = "src/data/claims.csv";
  const { headers, rows } = rowsFromCsv(readFileSync(join(process.cwd(), fileName), "utf8"));
  assertHeaders(headers, CLAIM_COLUMNS, fileName);
  const cardIds = new Set(loadCards().map((card) => card.id));
  const errors: string[] = [];
  const seen = new Set<string>();
  const claims: Claim[] = [];

  for (const row of rows) {
    const reference = row.reference.toUpperCase();
    if (!REFERENCE.test(reference)) errors.push(`${row.reference || "(blank)"}: reference must be 4–40 letters, digits, or hyphens`);
    if (seen.has(reference)) errors.push(`${reference}: duplicated reference`);
    seen.add(reference);
    if (!isIsoDate(row.submitted_at)) errors.push(`${reference}: submitted_at must be YYYY-MM-DD`);
    if (!row.applicant_alias || row.applicant_alias.length > 40 || /[@\r\n]/.test(row.applicant_alias) || /\d{8}/.test(row.applicant_alias)) {
      errors.push(`${reference}: applicant_alias must be a short display name, not an email or phone`);
    }
    if (!cardIds.has(row.card_id)) errors.push(`${reference}: card_id ${row.card_id} is not in cards.csv`);
    if (row.channel && !TOKEN.test(row.channel)) errors.push(`${reference}: channel must be a short token or blank`);
    if (row.post && !TOKEN.test(row.post)) errors.push(`${reference}: post must be a short token or blank`);
    if (!CLAIM_STATUSES.includes(row.status as ClaimStatus)) errors.push(`${reference}: unknown status ${row.status}`);

    const history: ClaimHistory[] = [];
    if (!row.status_history) errors.push(`${reference}: status_history is required`);
    for (const part of row.status_history.split("|").filter(Boolean)) {
      const [status, at] = part.split("@");
      if (!CLAIM_STATUSES.includes(status as ClaimStatus) || !at || !isIsoDate(at)) {
        errors.push(`${reference}: bad history entry ${part}`);
        continue;
      }
      history.push({ status: status as ClaimStatus, at });
    }
    for (let index = 1; index < history.length; index += 1) {
      if (history[index].at < history[index - 1].at) errors.push(`${reference}: status history dates go backwards`);
    }
    if (history.length > 0 && history[0].at !== row.submitted_at) {
      errors.push(`${reference}: submitted_at must match the first history date`);
    }
    if (history.length > 0 && history[history.length - 1].status !== row.status) {
      errors.push(`${reference}: status must match the last history entry`);
    }

    const noteHant = row.reward_note_zh_hant;
    const noteHans = row.reward_note_zh_hans;
    if (Boolean(noteHant) !== Boolean(noteHans)) errors.push(`${reference}: reward notes must be filled in both languages or neither`);
    if (noteHant.length > 240 || noteHans.length > 240) errors.push(`${reference}: reward note is too long`);

    let rewardAmountHkd: number | null = null;
    if (row.reward_amount_hkd) {
      if (!/^\d+$/.test(row.reward_amount_hkd)) errors.push(`${reference}: reward_amount_hkd must be a whole number or blank`);
      else rewardAmountHkd = Number(row.reward_amount_hkd);
    }

    const isSample = row.is_sample === "true";
    if (row.is_sample !== "true" && row.is_sample !== "false") errors.push(`${reference}: is_sample must be true or false`);
    if (isSample) {
      if (!reference.startsWith("MIA-SAMPLE-")) errors.push(`${reference}: sample references must start with MIA-SAMPLE-`);
      if (rewardAmountHkd !== null) errors.push(`${reference}: sample claims must leave reward_amount_hkd blank`);
      if (!noteHant.includes("示範") || !noteHans.includes("示范")) errors.push(`${reference}: sample notes must say they are samples`);
    } else if (reference.startsWith("MIA-SAMPLE-")) {
      errors.push(`${reference}: MIA-SAMPLE- references must stay marked is_sample=true`);
    }

    claims.push({
      reference,
      submittedAt: row.submitted_at,
      applicantAlias: row.applicant_alias,
      cardId: row.card_id,
      channel: row.channel,
      post: row.post,
      status: (CLAIM_STATUSES.includes(row.status as ClaimStatus) ? row.status : "submitted") as ClaimStatus,
      history,
      rewardNote: { "zh-hant": noteHant, "zh-hans": noteHans },
      rewardAmountHkd,
      isSample,
    });
  }

  if (claims.length === 0) errors.push("claims.csv has no rows");
  if (errors.length) throw new Error(`Claim file is invalid:\n- ${errors.join("\n- ")}`);
  cache = claims;
  return claims;
}
