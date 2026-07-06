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
  // True whenever the native layout direction doesn't match the active
  // locale — including first launch on an Arabic device, where JS runs in
  // Arabic but the app still renders LTR until a restart.
  needsRestart: boolean;
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

  useEffect(() => {
    const shouldRTL = locale === "ar";
    if (I18nManager.isRTL !== shouldRTL) {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
    }
  }, [locale]);

  // I18nManager.isRTL is fixed for the lifetime of the native session, so
  // this stays true until the app is actually restarted.
  const needsRestart = I18nManager.isRTL !== (locale === "ar");

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: dict[locale],
      needsRestart,
      setLocale: async (l) => {
        await SecureStore.setItemAsync(KEY, l);
        currentLocale = l;
        setLocaleState(l);
      },
    }),
    [locale, needsRestart],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
