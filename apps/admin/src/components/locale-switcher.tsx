"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale, useT } from "./locale-provider";

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const [pending, start] = useTransition();
  const next = locale === "en" ? "ar" : "en";

  function flip() {
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    start(() => router.refresh());
  }

  return (
    <button onClick={flip} disabled={pending} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-fg/85 hover:border-muted disabled:opacity-60">
      {locale.toUpperCase()} → {t.locale.switchTo}
    </button>
  );
}
