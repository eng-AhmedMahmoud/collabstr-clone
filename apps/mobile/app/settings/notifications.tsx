import { StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

// Preferences aren't persisted server-side yet — show the intended controls
// disabled instead of faking local persistence.
export default function NotificationSettings() {
  const { palette } = useTheme();
  const { t } = useI18n();

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.notifications} />}>
      <Card>
        <Row label={t.orders.title} value palette={palette} />
        <Row label={t.messages.title} value palette={palette} />
        <Row label={t.notifications.title} value={false} palette={palette} />
      </Card>
      <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{t.settings.notifSoon}</Text>
    </Screen>
  );
}

function Row({ label, value, palette }: { label: string; value: boolean; palette: any }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.fgMuted, flex: 1 }} numberOfLines={1}>{label}</Text>
      <Switch value={value} disabled trackColor={{ true: palette.brand, false: palette.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 6 },
});
