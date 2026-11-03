// Run with `pnpm --filter @collabstr/web test` (node:test; Node strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { DEFAULT_THEME, THEMES, THEME_BOOT_SCRIPT, THEME_STORAGE_KEY, resolveTheme } from "./theme.ts";

// Runs the inline boot script against a fake page whose OS prefers dark.
function boot(stored) {
  const classes = new Set();
  const store = stored === undefined ? {} : { [THEME_STORAGE_KEY]: stored };
  vm.runInNewContext(THEME_BOOT_SCRIPT, {
    localStorage: { getItem: (k) => (k in store ? store[k] : null) },
    document: { documentElement: { classList: { add: (c) => classes.add(c) } } },
    window: { matchMedia: () => ({ matches: true }) },
  });
  return classes.has("dark") ? "dark" : "light";
}

test("the switcher offers exactly Light and Dark, defaulting to Light", () => {
  assert.deepEqual([...THEMES], ["light", "dark"]);
  assert.equal(DEFAULT_THEME, "light");
});

test("a stored system, nothing stored, or junk resolves to the default", () => {
  assert.equal(resolveTheme("system"), DEFAULT_THEME);
  assert.equal(resolveTheme(null), DEFAULT_THEME);
  assert.equal(resolveTheme("auto"), DEFAULT_THEME);
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("light"), "light");
});

test("boot script ignores the OS scheme and honours only a saved choice", () => {
  assert.equal(boot(undefined), DEFAULT_THEME);
  assert.equal(boot("system"), DEFAULT_THEME);
  assert.equal(boot("light"), "light");
  assert.equal(boot("dark"), "dark");
});

test("no theme code reads prefers-color-scheme", () => {
  const toggle = readFileSync(new URL("../components/theme-toggle.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(THEME_BOOT_SCRIPT, /prefers-color-scheme/);
  assert.doesNotMatch(toggle, /prefers-color-scheme/);
});
