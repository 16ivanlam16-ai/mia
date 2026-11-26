export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

export function serializeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
