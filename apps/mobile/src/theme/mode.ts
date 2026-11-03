// Theme choice is a two-way switch, Light or Dark — the app never follows
// the OS scheme. Kept free of React Native imports so `node --test` can load it.

export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

// Designed default: the light palette (web's bare @theme tokens are light too).
export const DEFAULT_THEME_MODE: ThemeMode = "light";

// Older builds could save "system"; that, nothing saved, or anything unknown
// resolves to the default.
export function resolveThemeMode(v: unknown): ThemeMode {
  return v === "light" || v === "dark" ? v : DEFAULT_THEME_MODE;
}
