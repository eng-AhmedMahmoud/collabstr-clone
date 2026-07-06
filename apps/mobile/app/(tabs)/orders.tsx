import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/Badge";
import { Chip } from "@/components/Chip";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Money } from "@/components/Money";
import { useMyOrders, type OrderListItem } from "@/api/queries";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";
import type { OrderStatus } from "@collabstr/shared-types";

type Filter = "all" | "active" | "done" | "disputed";

export default function OrdersTab() {
  const { me } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const q = useMyOrders(me?.role === "creator" ? "creator" : me?.role === "brand" ? "brand" : undefined);

  const filtered = useMemo(() => filterOrders(q.data ?? [], filter), [q.data, filter]);

  if (!me) {
    return (
      <Screen padded>
        <View style={{ paddingVertical: spacing.xxl }}>
          <EmptyState
            title={t.profile.guestTitle}
            subtitle={t.profile.guestSubtitle}
            icon="receipt-outline"
            action={<Button title={t.profile.goLogin} onPress={() => router.push("/(auth)/login")} />}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerBar}>
        <Text style={[styles.title, { color: palette.fg }]}>{t.orders.title}</Text>
      </View>
      <View style={styles.chipsRow}>
        <Chip label={t.orders.filterAll} active={filter === "all"} onPress={() => setFilter("all")} />
        <Chip label={t.orders.filterActive} active={filter === "active"} onPress={() => setFilter("active")} />
        <Chip label={t.orders.filterDone} active={filter === "done"} onPress={() => setFilter("done")} />
        <Chip label={t.orders.filterDisputed} active={filter === "disputed"} onPress={() => setFilter("disputed")} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
          ) : q.error ? (
            <View style={styles.center}><Text style={{ color: palette.danger }}>{t.common.error}</Text></View>
          ) : (
            <EmptyState title={t.orders.empty} icon="receipt-outline" />
          )
        }
        renderItem={({ item }) => (
          <OrderRow item={item} role={me.role} onPress={() => router.push(`/orders/${item.id}`)} />
        )}
      />
    </Screen>
  );
}

function filterOrders(items: OrderListItem[], f: Filter): OrderListItem[] {
  if (f === "all") return items;
  if (f === "disputed") return items.filter((o) => o.status === "disputed");
  const doneSet: OrderStatus[] = ["released", "cancelled"];
  if (f === "done") return items.filter((o) => doneSet.includes(o.status));
  return items.filter((o) => !doneSet.includes(o.status) && o.status !== "disputed");
}

function OrderRow({ item, role, onPress }: { item: OrderListItem; role: string; onPress: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const peer = role === "creator" ? item.brand : item.creator.user;
  const tone = statusTone(item.status);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 }]}
    >
      <Avatar uri={peer.avatarUrl} seed={peer.name} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: palette.fg }]} numberOfLines={1}>{item.package.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
          <Text style={{ color: palette.fgMuted, fontSize: 12 }} numberOfLines={1}>{peer.name} · </Text>
          <Money value={item.total} style={{ color: palette.fgMuted, fontSize: 12 }} />
        </View>
      </View>
      <Badge label={t.status[item.status] ?? item.status} tone={tone as any} />
    </Pressable>
  );
}

function statusTone(s: OrderStatus): "brand" | "success" | "danger" | "neutral" | "accent" {
  if (s === "released" || s === "approved") return "success";
  if (s === "disputed") return "danger";
  if (s === "cancelled") return "neutral";
  if (s === "revision_requested") return "accent";
  return "brand";
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: 22, fontWeight: "800" },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { padding: spacing.xxl, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 2 },
});
