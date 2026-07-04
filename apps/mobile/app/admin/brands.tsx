import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useAdminBrands } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AdminBrands() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useAdminBrands();
  return (
    <Screen padded={false} header={<AppHeader title={t.admin.brands} />}>
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
            <EmptyState title={t.common.empty} icon="business-outline" />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.fg, fontWeight: "700" }}>{item.name}</Text>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{item.email}</Text>
              </View>
              {item.banned ? <Badge label={t.admin.ban} tone="danger" /> : null}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
