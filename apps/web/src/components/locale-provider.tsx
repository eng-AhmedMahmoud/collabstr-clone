"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "@/lib/i18n";

const Ctx = createContext<{ locale: Locale; t: Dict } | null>(null);

export function LocaleProvider({ locale, t, children }: { locale: Locale; t: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t }}>{children}</Ctx.Provider>;
}

export function useT(): Dict {
  const v = useContext(Ctx);
  if (!v) throw new Error("LocaleProvider missing");
  return v.t;
}

export function useLocale(): Locale {
  const v = useContext(Ctx);
  return v?.locale ?? "en";
}
