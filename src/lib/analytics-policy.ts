const GA_ID = /^G-[A-Z0-9]{4,32}$/;
const GSC_TOKEN = /^[A-Za-z0-9_-]{8,200}$/;

export function resolveGaId(raw: string | undefined | null): string {
  const id = (raw ?? "").trim();
  if (!id) return "";
  if (!GA_ID.test(id) || /X{4,}/.test(id)) {
    console.warn(`[mia] Ignoring PUBLIC_GA_MEASUREMENT_ID "${id}". Expected a real GA4 ID such as G-AB12CD34EF.`);
    return "";
  }
  return id;
}

export function resolveGsc(raw: string | undefined | null): string {
  const token = (raw ?? "").trim();
  if (!token) return "";
  if (!GSC_TOKEN.test(token)) {
    console.warn("[mia] Ignoring PUBLIC_GSC_VERIFICATION because it is not a plain verification token.");
    return "";
  }
  return token;
}

export function resolveWebhook(raw: string | undefined | null): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) {
      console.warn("[mia] Ignoring PUBLIC_CLICK_WEBHOOK_URL. Use an https URL without embedded credentials.");
      return "";
    }
    return url.href;
  } catch {
    console.warn("[mia] Ignoring PUBLIC_CLICK_WEBHOOK_URL because it is not a URL.");
    return "";
  }
}
