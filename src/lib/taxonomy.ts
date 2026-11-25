export const LANGS = ["zh-hant", "zh-hans"] as const;
export type Lang = (typeof LANGS)[number];

export const AUDIENCES = ["hk-local", "new-arrival", "ttps", "iang", "qmas", "student"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const REWARD_TYPES = ["cashback", "miles", "points", "hybrid"] as const;
export type RewardType = (typeof REWARD_TYPES)[number];

export const NETWORKS = ["visa", "mastercard", "unionpay", "amex", "jcb"] as const;
export type Network = (typeof NETWORKS)[number];

export const CARD_STATUSES = ["placeholder", "published"] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const CLAIM_STATUSES = [
  "submitted",
  "under_review",
  "needs_info",
  "approved",
  "rejected",
  "reward_pending",
  "reward_paid",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const INCOME_PERIODS = ["monthly", "annual"] as const;
export type IncomePeriod = (typeof INCOME_PERIODS)[number];

export const HTML_LANG: Record<Lang, string> = {
  "zh-hant": "zh-Hant-HK",
  "zh-hans": "zh-Hans",
};

export const HREFLANG: Record<Lang, string> = {
  "zh-hant": "zh-Hant-HK",
  "zh-hans": "zh-Hans",
};

export const OG_LOCALE: Record<Lang, string> = {
  "zh-hant": "zh_HK",
  "zh-hans": "zh_CN",
};

export function isLang(value: string | undefined): value is Lang {
  return value === "zh-hant" || value === "zh-hans";
}

export function localePaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}
