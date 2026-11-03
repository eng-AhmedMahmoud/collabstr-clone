import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme, THEME_MODES, type ThemeMode } from "@/theme/context";
import { useI18n } from "@/i18n/context";

export default function AppearanceSettings() {
  const { palette, mode, setMode } = useTheme();
  const { t, isRTL } = useI18n();
  const align = isRTL ? "right" : "left";
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.appearance} />}>
      <Card>
        <Text style={{ color: palette.fgMuted, fontSize: 12, textTransform: "uppercase", fontWeight: "700", textAlign: align }}>
          {t.settings.appearance}
        </Text>
        <SegmentedControl<ThemeMode>
          options={THEME_MODES.map((value) => ({
            value,
            label: value === "light" ? t.settings.modeLight : t.settings.modeDark,
            icon: value === "light" ? ("sunny-outline" as const) : ("moon-outline" as const),
          }))}
          value={mode}
          onChange={setMode}
        />
      </Card>
    </Screen>
  );
}
