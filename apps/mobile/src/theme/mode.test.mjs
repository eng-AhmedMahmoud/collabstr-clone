// Run with `pnpm --filter @collabstr/mobile test` (node:test; Node strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_THEME_MODE, THEME_MODES, resolveThemeMode } from "./mode.ts";

const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

test("the appearance switcher offers exactly Light and Dark, defaulting to Light", () => {
  assert.deepEqual([...THEME_MODES], ["light", "dark"]);
  assert.equal(DEFAULT_THEME_MODE, "light");
  assert.match(read("../../app/settings/appearance.tsx"), /THEME_MODES\.map/);
});

test("a stored system, nothing stored, or junk resolves to the default", () => {
  assert.equal(resolveThemeMode("system"), DEFAULT_THEME_MODE);
  assert.equal(resolveThemeMode(null), DEFAULT_THEME_MODE);
  assert.equal(resolveThemeMode("auto"), DEFAULT_THEME_MODE);
  assert.equal(resolveThemeMode("dark"), "dark");
  assert.equal(resolveThemeMode("light"), "light");
});

test("the app theme no longer follows the OS and the System label is gone", () => {
  assert.doesNotMatch(read("./context.tsx"), /useColorScheme/);
  assert.doesNotMatch(read("../i18n/dict.ts"), /modeSystem/);
});
