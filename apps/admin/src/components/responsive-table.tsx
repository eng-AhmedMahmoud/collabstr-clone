import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  minWidth?: number;
};

export function ResponsiveTable({ minWidth = 760, className = "", children, ...rest }: Props) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-border ${className}`} {...rest}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
