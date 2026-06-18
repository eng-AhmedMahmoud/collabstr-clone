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
    <button
      onClick={flip}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border text-xs font-semibold text-fg/80 hover:text-fg hover:border-fg disabled:opacity-60"
      aria-label="Switch language"
    >
      <span className="opacity-60">{locale.toUpperCase()}</span>
      <span>→</span>
      <span>{t.locale.switchTo}</span>
    </button>
  );
}
