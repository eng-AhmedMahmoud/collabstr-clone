import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/Money";
import { useAdminPayouts } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AdminPayouts() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useAdminPayouts();
  return (
    <Screen padded={false} header={<AppHeader title={t.admin.payouts} />}>
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
            <EmptyState title={t.common.empty} icon="wallet-outline" />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.fg, fontWeight: "700" }}>@{item.creator.username}</Text>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Money value={item.amount} style={{ color: palette.brand, fontWeight: "700" }} />
              <Badge label={item.status} tone="brand" />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
});
