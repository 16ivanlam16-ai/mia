import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SiteProfile = {
  contactEmail: string | null;
  legalEntityName: string | null;
  social: {
    instagram: string | null;
    xiaohongshu: string | null;
  };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadProfile(): SiteProfile {
  const file = join(process.cwd(), "src/data/site.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const allowed = new Set(["contactEmail", "legalEntityName", "social"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) throw new Error(`src/data/site.json has unexpected key ${key}`);
  }

  const email = raw.contactEmail;
  const entity = raw.legalEntityName;
  if (email !== null && typeof email !== "string") throw new Error("contactEmail must be a string or null");
  if (entity !== null && typeof entity !== "string") throw new Error("legalEntityName must be a string or null");
  if (typeof email === "string" && (!EMAIL.test(email) || /[\r\n]/.test(email) || email.length > 80)) {
    throw new Error("contactEmail is not a usable email address");
  }
  if (typeof entity === "string" && (entity.trim().length === 0 || entity.length > 120 || /[\r\n]/.test(entity))) {
    throw new Error("legalEntityName must be a single line when it is set");
  }

  const socialRaw = raw.social;
  const social = { instagram: null as string | null, xiaohongshu: null as string | null };
  if (socialRaw != null) {
    if (typeof socialRaw !== "object" || Array.isArray(socialRaw)) throw new Error("social must be an object or omitted");
    const record = socialRaw as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (key !== "instagram" && key !== "xiaohongshu") throw new Error(`unexpected social key ${key}`);
    }
    for (const key of ["instagram", "xiaohongshu"] as const) {
      const value = record[key];
      if (value == null) continue;
      if (typeof value !== "string" || !/^https:\/\/[^\s]+$/.test(value) || value.length > 200) {
        throw new Error(`${key} must be an https URL or null`);
      }
      social[key] = value;
    }
  }

  return {
    contactEmail: typeof email === "string" ? email : null,
    legalEntityName: typeof entity === "string" ? entity.trim() : null,
    social,
  };
}
