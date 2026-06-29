import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function DashboardBrandBar({
  role,
  brandName,
  consoleLabelEn,
  consoleLabelAr,
}: {
  role: "brand" | "creator";
  brandName: string;
  consoleLabelEn: string;
  consoleLabelAr: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-200 dark:border-brand-800/60 bg-elevated/80 backdrop-blur-md p-4 sm:p-5 flex items-center gap-4 flex-wrap shadow-lg shadow-brand-100/40 dark:shadow-brand-900/30">
      <Link href="/" className="flex items-center gap-3 group">
        <span className="h-11 w-11 rounded-xl brand-gradient brand-glow grid place-items-center text-white font-black text-xl group-hover:scale-105 transition-transform">
          ن
        </span>
        <div className="leading-tight">
          <p className="font-black text-lg text-fg">
            {brandName} <span className="text-muted font-bold">· نخلة</span>
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
            {consoleLabelEn} · {consoleLabelAr}
          </p>
        </div>
      </Link>

      <div className="ms-auto flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
          <span>🇸🇦</span> KSA · SAR ر.س
        </span>
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
