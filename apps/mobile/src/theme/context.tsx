import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { colors, type Palette } from "./index";
import { DEFAULT_THEME_MODE, resolveThemeMode, type ThemeMode } from "./mode";

export { THEME_MODES, type ThemeMode } from "./mode";
export type Scheme = ThemeMode;

type ThemeCtx = {
  palette: Palette;
  scheme: Scheme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => Promise<void>;
};

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "nakhla.themeMode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((v) => {
      const m = resolveThemeMode(v);
      setModeState(m);
      // Rewrite a legacy "system" (or any unknown value) as the resolved mode.
      if (v !== null && v !== m) SecureStore.setItemAsync(KEY, m).catch(() => {});
    });
  }, []);

  const setMode = useCallback(async (m: ThemeMode) => {
    await SecureStore.setItemAsync(KEY, m);
    setModeState(m);
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({ palette: colors[mode], scheme: mode, mode, setMode }),
    [mode, setMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme outside ThemeProvider");
  return v;
}
