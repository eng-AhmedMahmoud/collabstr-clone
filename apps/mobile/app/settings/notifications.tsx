import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function NotificationSettings() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [orders, setOrders] = useState(true);
  const [msgs, setMsgs] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.notifications} />}>
      <Card>
        <Row label={t.orders.title} value={orders} onChange={setOrders} palette={palette} />
        <Row label={t.messages.title} value={msgs} onChange={setMsgs} palette={palette} />
        <Row label={t.brand.tagline} value={marketing} onChange={setMarketing} palette={palette} />
      </Card>
      <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{t.settings.billingSoon}</Text>
    </Screen>
  );
}

function Row({ label, value, onChange, palette }: { label: string; value: boolean; onChange: (v: boolean) => void; palette: any }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.fg, flex: 1 }} numberOfLines={1}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: palette.brand, false: palette.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 6 },
});
