import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/Money";
import { useAdminOrders } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";
import type { OrderStatus } from "@collabstr/shared-types";

const STATUSES: (OrderStatus | "")[] = ["", "pending_payment", "in_progress", "submitted", "approved", "released", "disputed", "cancelled"];

export default function AdminOrders() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const q = useAdminOrders(status || undefined);
  return (
    <Screen padded={false} header={<AppHeader title={t.admin.orders} />}>
      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Chip
            key={s || "all"}
            label={s ? t.status[s as OrderStatus] : t.orders.filterAll}
            active={status === s}
            onPress={() => setStatus(s as any)}
          />
        ))}
      </View>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={{ padding: spacing.xxl, alignItems: "center" }}><ActivityIndicator color={palette.brand} /></View>
          ) : (
            <EmptyState title={t.orders.empty} icon="receipt-outline" />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/admin/orders/${item.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{item.package.title}</Text>
                <Badge label={t.status[item.status]} tone="brand" />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{item.creator.user.name} → {item.brand.name} · </Text>
                <Money value={item.total} style={{ color: palette.fgMuted, fontSize: 12 }} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, padding: spacing.lg, paddingBottom: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
});
