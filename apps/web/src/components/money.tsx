import { RiyalSymbol } from "./riyal-symbol";

// Renders a price with the new Saudi Riyal symbol instead of the "SAR"/"ر.س"
// text. Number is locale-formatted; the symbol precedes the amount and inherits
// the surrounding text color/size.
export function Money({
  value,
  locale = "en-SA",
  compact = false,
  className,
  symbolClassName,
}: {
  value: number | null | undefined;
  locale?: string;
  compact?: boolean;
  className?: string;
  symbolClassName?: string;
}) {
  if (value == null) return <span className={className}>—</span>;
  const num = value.toLocaleString(locale, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  });
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className ?? ""}`}>
      <RiyalSymbol className={symbolClassName} />
      <span>{num}</span>
    </span>
  );
}
