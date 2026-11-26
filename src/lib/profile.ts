import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SiteProfile = {
  contactEmail: string | null;
  legalEntityName: string | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadProfile(): SiteProfile {
  const file = join(process.cwd(), "src/data/site.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const allowed = new Set(["contactEmail", "legalEntityName"]);
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

  return {
    contactEmail: typeof email === "string" ? email : null,
    legalEntityName: typeof entity === "string" ? entity.trim() : null,
  };
}
