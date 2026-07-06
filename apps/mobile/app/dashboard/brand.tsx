import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/Money";
import { useMyCampaigns, useMyOrders } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function BrandDashboard() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const orders = useMyOrders("brand");
  const campaigns = useMyCampaigns();

  const totalSpend = useMemo(
    () => (orders.data ?? []).filter((o) => o.status === "released").reduce((sum, o) => sum + o.total, 0),
    [orders.data],
  );

  return (
    <Screen scroll padded header={<AppHeader title={t.dashboard.brandTitle} />}>
      <View style={styles.statsRow}>
        <StatCard label={t.dashboard.kpiOrders} value={String(orders.data?.length ?? 0)} />
        <StatCard label={t.dashboard.kpiSpend} value={`${totalSpend}`} money />
      </View>
      <View style={styles.statsRow}>
        <StatCard label={t.dashboard.kpiCampaigns} value={String(campaigns.data?.length ?? 0)} />
      </View>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.recentOrders}</Text>
      {orders.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : (orders.data?.length ?? 0) === 0 ? (
        <EmptyState title={t.orders.empty} icon="receipt-outline" />
      ) : (
        orders.data!.slice(0, 5).map((o) => (
          <Pressable key={o.id} onPress={() => router.push(`/orders/${o.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{o.package.title}</Text>
                <Badge label={t.status[o.status]} tone="brand" />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{o.creator.user.name} · </Text>
                <Money value={o.total} style={{ color: palette.fgMuted, fontSize: 12 }} />
              </View>
            </Card>
          </Pressable>
        ))
      )}

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.myCampaigns}</Text>
      {campaigns.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : (campaigns.data?.length ?? 0) === 0 ? (
        <EmptyState title={t.campaigns.empty} icon="megaphone-outline" />
      ) : (
        campaigns.data!.slice(0, 5).map((c) => (
          <Pressable key={c.id} onPress={() => router.push(`/campaigns/${c.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{c.title}</Text>
                <Badge label={t.campaigns.status[c.status]} tone={c.status === "open" ? "success" : "neutral"} />
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: spacing.sm },
  section: { fontSize: 12, textTransform: "uppercase", fontWeight: "700", marginTop: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
});
