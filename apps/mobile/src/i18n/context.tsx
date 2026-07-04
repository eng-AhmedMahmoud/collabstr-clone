import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nManager } from "react-native";
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
  dir: "ltr" | "rtl";
  t: Dict;
  setLocale: (l: Locale) => Promise<void>;
  restartRequired: boolean;
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
  const [restartRequired, setRestartRequired] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((v) => {
      if (v === "ar" || v === "en") {
        currentLocale = v;
        setLocaleState(v);
      }
    });
  }, []);

  useEffect(() => {
    const shouldRTL = locale === "ar";
    if (I18nManager.isRTL !== shouldRTL) {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
      setRestartRequired(true);
    }
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: dict[locale],
      restartRequired,
      setLocale: async (l) => {
        await SecureStore.setItemAsync(KEY, l);
        currentLocale = l;
        setLocaleState(l);
      },
    }),
    [locale, restartRequired],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
