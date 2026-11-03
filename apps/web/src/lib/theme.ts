// Theme choice is a two-way switch, Light or Dark — the site never follows
// the OS `prefers-color-scheme`. No imports so `node --test` can load it.

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "nakhla.theme";

// Designed default: light — the bare @theme tokens in globals.css; `.dark` is opt-in.
export const DEFAULT_THEME: Theme = "light";

// Nothing saved, a legacy "system", or anything unknown resolves to the default.
export function resolveTheme(stored: string | null | undefined): Theme {
  return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
}

// Inline <head> script: applies the saved theme before first paint.
export const THEME_BOOT_SCRIPT = `(() => {
  try {
    var s = localStorage.getItem('${THEME_STORAGE_KEY}');
    var m = s === 'light' || s === 'dark' ? s : '${DEFAULT_THEME}';
    if (m === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;
