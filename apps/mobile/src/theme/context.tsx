import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { colors, type Palette } from "./index";

export type ThemeMode = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

type ThemeCtx = {
  palette: Palette;
  scheme: Scheme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => Promise<void>;
};

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "nakhla.themeMode";

function isMode(v: unknown): v is ThemeMode {
  return v === "system" || v === "light" || v === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((v) => {
      if (isMode(v)) setModeState(v);
    });
  }, []);

  const scheme: Scheme = mode === "system" ? (system === "dark" ? "dark" : "light") : mode;

  const setMode = useCallback(async (m: ThemeMode) => {
    await SecureStore.setItemAsync(KEY, m);
    setModeState(m);
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({ palette: colors[scheme], scheme, mode, setMode }),
    [scheme, mode, setMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme outside ThemeProvider");
  return v;
}
