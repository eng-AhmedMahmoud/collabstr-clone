export function fmtFollowers(n?: number | null): string {
  if (n == null || n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

export const CURRENCY = "SAR" as const;
export const CURRENCY_SYMBOL = "ر.س" as const;
export const LOCALE = "en-SA" as const;

export function fmtMoney(n: number, opts: { compact?: boolean; locale?: string } = {}): string {
  const locale = opts.locale ?? LOCALE;
  return n.toLocaleString(locale, {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  });
}

export function fmtPrice(n: number): string {
  return `${CURRENCY_SYMBOL} ${n.toLocaleString("en-SA")}`;
}
