import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useI18n } from "@/i18n/context";
import { useTheme } from "@/theme/context";
import { useSetLocale } from "@/api/mutations";
import { spacing } from "@/theme";
import type { Locale } from "@/i18n/dict";

export default function LanguageSettings() {
  const { palette } = useTheme();
  const { t, locale, setLocale, isRTL } = useI18n();
  const mirror = useSetLocale();

  const change = async (l: Locale) => {
    // Applies live — the root direction wrapper flips layout instantly, no
    // restart. We still persist locally and mirror the choice to the server.
    await setLocale(l);
    mirror.mutate(l);
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.language} />}>
      <Card>
        <Text
          style={{
            color: palette.fgMuted,
            fontSize: 12,
            textTransform: "uppercase",
            fontWeight: "700",
            textAlign: isRTL ? "right" : "left",
          }}
        >
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
      <Text
        style={{
          color: palette.fgMuted,
          fontSize: 12,
          marginTop: spacing.sm,
          textAlign: isRTL ? "right" : "left",
        }}
      >
        {t.brand.tagline}
      </Text>
    </Screen>
  );
}
