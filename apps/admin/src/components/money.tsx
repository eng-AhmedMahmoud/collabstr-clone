import { RiyalSymbol } from "./riyal-symbol";

export function Money({ value, locale = "en-SA", className }: { value?: number | null; locale?: string; className?: string }) {
  if (value == null) return <span className={className}>—</span>;
  const num = value.toLocaleString(locale, { maximumFractionDigits: 0 });
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className ?? ""}`}>
      <RiyalSymbol />
      <span>{num}</span>
    </span>
  );
}
