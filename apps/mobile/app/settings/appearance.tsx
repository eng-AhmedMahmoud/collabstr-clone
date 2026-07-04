import { Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme, type ThemeMode } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AppearanceSettings() {
  const { palette, mode, setMode, scheme } = useTheme();
  const { t } = useI18n();
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.appearance} />}>
      <Card>
        <Text style={{ color: palette.fgMuted, fontSize: 12, textTransform: "uppercase", fontWeight: "700" }}>
          {t.settings.appearance}
        </Text>
        <SegmentedControl<ThemeMode>
          options={[
            { value: "system", label: t.settings.modeSystem },
            { value: "light", label: t.settings.modeLight },
            { value: "dark", label: t.settings.modeDark },
          ] as const}
          value={mode}
          onChange={setMode}
        />
        <View style={{ marginTop: spacing.sm }}>
          <Text style={{ color: palette.fgMuted, fontSize: 12 }}>
            {t.settings.modeSystem} → {scheme}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
