export const CURRENCY = "SAR" as const;
export const CURRENCY_SYMBOL = "ر.س" as const;
export const LOCALE = "en-SA" as const;

export function fmtMoney(n?: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
}
export function fmtNum(n?: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
export function fmtDate(s?: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleString(LOCALE, { timeZone: "Asia/Riyadh" });
}
export function fmtAgo(s?: string | null): string {
  if (!s) return "—";
  const sec = Math.floor((Date.now() - new Date(s).getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86_400)}d ago`;
}
