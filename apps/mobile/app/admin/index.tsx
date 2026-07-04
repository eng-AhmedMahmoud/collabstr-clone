import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { StatCard } from "@/components/StatCard";
import { ListItem } from "@/components/ListItem";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { useAdminOverview } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AdminHome() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useAdminOverview();

  return (
    <Screen scroll padded header={<AppHeader title={t.admin.title} />}>
      {q.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : q.data ? (
        <>
          <View style={styles.statsRow}>
            <StatCard label={t.admin.kpiUsers} value={String(q.data.users)} />
            <StatCard label={t.admin.kpiCreators} value={String(q.data.creators)} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label={t.admin.kpiOrders} value={String(q.data.orders)} />
            <StatCard label={t.admin.kpiRevenue} value={String(q.data.revenue)} hint={t.discover.sar} />
          </View>
        </>
      ) : null}

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.admin.title}</Text>
      <ListItem label={t.admin.users} icon="people-outline" onPress={() => router.push("/admin/users")} />
      <ListItem label={t.admin.creators} icon="star-outline" onPress={() => router.push("/admin/creators")} />
      <ListItem label={t.admin.brands} icon="business-outline" onPress={() => router.push("/admin/brands")} />
      <ListItem label={t.admin.mawthooq} icon="shield-checkmark-outline" onPress={() => router.push("/admin/mawthooq")} />
      <ListItem label={t.admin.campaigns} icon="megaphone-outline" onPress={() => router.push("/admin/campaigns")} />
      <ListItem label={t.admin.orders} icon="receipt-outline" onPress={() => router.push("/admin/orders")} />
      <ListItem label={t.admin.disputes} icon="warning-outline" onPress={() => router.push("/admin/disputes")} />
      <ListItem label={t.admin.reviews} icon="chatbubble-ellipses-outline" onPress={() => router.push("/admin/reviews")} />
      <ListItem label={t.admin.payouts} icon="wallet-outline" onPress={() => router.push("/admin/payouts")} />
      <ListItem label={t.admin.audit} icon="document-text-outline" onPress={() => router.push("/admin/audit")} />
      <ListItem label={t.admin.broadcast} icon="notifications-outline" onPress={() => router.push("/admin/broadcast")} />

      {q.data ? (
        <>
          <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.recentOrders}</Text>
          {q.data.recentOrders.slice(0, 5).map((o) => (
            <Pressable key={o.id} onPress={() => router.push(`/admin/orders/${o.id}`)}>
              <Card>
                <View style={styles.rowBetween}>
                  <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{o.package.title}</Text>
                  <Badge label={t.status[o.status]} tone="brand" />
                </View>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{o.creator.user.name} → {o.brand.name} · {o.total} {t.discover.sar}</Text>
              </Card>
            </Pressable>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: spacing.sm },
  section: { fontSize: 12, textTransform: "uppercase", fontWeight: "700", marginTop: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
});
