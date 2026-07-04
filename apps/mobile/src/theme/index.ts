// Nakhla brand tokens. Mirrors apps/web/src/app/globals.css so mobile and
// web stay in visual sync — edit both when tuning the palette.

export const colors = {
  light: {
    bg: "#fbfffd",
    surface: "#eef9f2",
    card: "#ffffff",
    fg: "#062017",
    fgMuted: "#5b7068",
    border: "#d7ece0",
    brand: "#0fb27a",
    brand2: "#34d399",
    accent: "#f5c451",
    ksa: "#006C35",
    danger: "#dc2626",
    success: "#059669",
  },
  dark: {
    bg: "#04120c",
    surface: "#0a1f16",
    card: "#0d271b",
    fg: "#e7f5ed",
    fgMuted: "#8ea59a",
    border: "#183a2a",
    brand: "#34d399",
    brand2: "#0fb27a",
    accent: "#f5c451",
    ksa: "#0a8f45",
    danger: "#f87171",
    success: "#34d399",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type Palette = (typeof colors)[ColorScheme];

export const brandRamp = {
  50: "#e8f9f1",
  100: "#c9f0dd",
  200: "#94e2bd",
  300: "#5fd39c",
  400: "#34c383",
  500: "#0fb27a",
  600: "#0d9666",
  700: "#0a7952",
  800: "#075c3e",
  900: "#043f2a",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 };
export const type = {
  h1: { fontSize: 28, fontWeight: "800" as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: "500" as const, lineHeight: 14 },
};
