export function formatHkd(amount: number): string {
  const formatted = new Intl.NumberFormat("en-HK", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `HK$${formatted}`;
}
