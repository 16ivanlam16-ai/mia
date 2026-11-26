import type { Lang } from "../lib/taxonomy";
import { zhHans } from "./zh-hans";
import { zhHant, type Messages } from "./zh-hant";

export type { Messages };
export const messages: Record<Lang, Messages> = {
  "zh-hant": zhHant,
  "zh-hans": zhHans,
};

export function useMessages(lang: Lang): Messages {
  return messages[lang];
}
