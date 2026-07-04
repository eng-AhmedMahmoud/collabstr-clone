import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useAdminAudit } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AdminAudit() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useAdminAudit();
  return (
    <Screen padded={false} header={<AppHeader title={t.admin.audit} />}>
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
            <EmptyState title={t.common.empty} icon="document-text-outline" />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={{ color: palette.fg, fontWeight: "700" }}>{item.action}</Text>
            <Text style={{ color: palette.fgMuted, fontSize: 12 }}>
              {item.actor} · {new Date(item.createdAt).toLocaleString()}
            </Text>
            {item.target ? <Text style={{ color: palette.fgMuted, fontSize: 12 }}>→ {item.target}</Text> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
