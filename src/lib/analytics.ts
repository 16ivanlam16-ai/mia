import { resolveGaId, resolveGsc, resolveWebhook } from "./analytics-policy";

export const gaMeasurementId = resolveGaId(import.meta.env.PUBLIC_GA_MEASUREMENT_ID);
export const gscVerification = resolveGsc(import.meta.env.PUBLIC_GSC_VERIFICATION);
export const clickWebhookUrl = resolveWebhook(import.meta.env.PUBLIC_CLICK_WEBHOOK_URL);
