import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import { dict, type Dict, type Locale } from "./dict";

const KEY = "nakhla.locale";

// Module-level current locale — the API client reads this to attach the
// Accept-Language header without needing React context in async callers.
let currentLocale: Locale = "en";
export function getCurrentLocale(): Locale {
  return currentLocale;
}

type Ctx = {
  locale: Locale;
  // Layout direction derived purely from the active locale. Consumers apply
  // this in JS (root `direction` style + textAlign) so switching language flips
  // the UI live, with no native reload — I18nManager.forceRTL is never called.
  dir: "ltr" | "rtl";
  isRTL: boolean;
  t: Dict;
  setLocale: (l: Locale) => Promise<void>;
};

const I18nCtx = createContext<Ctx | null>(null);

function detectInitial(): Locale {
  const tag = Localization.getLocales()[0]?.languageCode;
  return tag === "ar" ? "ar" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const l = detectInitial();
    currentLocale = l;
    return l;
  });

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((v) => {
      if (v === "ar" || v === "en") {
        currentLocale = v;
        setLocaleState(v);
      }
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const isRTL = locale === "ar";
    return {
      locale,
      dir: isRTL ? "rtl" : "ltr",
      isRTL,
      t: dict[locale],
      setLocale: async (l) => {
        // Persist so the choice survives a real relaunch, then update state —
        // the new `dir`/`isRTL` re-render the tree and flip layout immediately.
        await SecureStore.setItemAsync(KEY, l);
        currentLocale = l;
        setLocaleState(l);
      },
    };
  }, [locale]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
