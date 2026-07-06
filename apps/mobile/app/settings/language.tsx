import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useI18n } from "@/i18n/context";
import { useTheme } from "@/theme/context";
import { useSetLocale } from "@/api/mutations";
import { spacing } from "@/theme";
import type { Locale } from "@/i18n/dict";
import * as Updates from "expo-updates";

export default function LanguageSettings() {
  const { palette } = useTheme();
  const { t, locale, setLocale, needsRestart } = useI18n();
  const mirror = useSetLocale();
  const [restartFailed, setRestartFailed] = useState(false);

  const change = async (l: Locale) => {
    await setLocale(l);
    mirror.mutate(l);
  };

  const restart = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Expo Go: updates are disabled — tell the user what to do instead.
      setRestartFailed(true);
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.language} />}>
      <Card>
        <Text style={{ color: palette.fgMuted, fontSize: 12, textTransform: "uppercase", fontWeight: "700" }}>
          {t.settings.language}
        </Text>
        <SegmentedControl<Locale>
          options={[
            { value: "en", label: t.settings.langEn },
            { value: "ar", label: t.settings.langAr },
          ] as const}
          value={locale}
          onChange={change}
        />
      </Card>
      {needsRestart ? (
        <Card>
          <Text style={{ color: palette.fg }}>
            {restartFailed ? t.settings.restartFailed : t.settings.rtlBanner}
          </Text>
          {!restartFailed ? <Button title={t.settings.restartNow} onPress={restart} /> : null}
        </Card>
      ) : null}
      <Text style={{ color: palette.fgMuted, fontSize: 12, marginTop: spacing.sm }}>
        {t.brand.tagline}
      </Text>
    </Screen>
  );
}
