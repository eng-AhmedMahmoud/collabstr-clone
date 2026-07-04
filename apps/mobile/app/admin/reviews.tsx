import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useAdminReviews } from "@/api/queries";
import { useAdminDeleteReview } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useConfirm } from "@/components/useConfirm";
import { spacing } from "@/theme";

export default function AdminReviews() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const confirm = useConfirm();
  const q = useAdminReviews();
  const del = useAdminDeleteReview();

  return (
    <Screen padded={false} header={<AppHeader title={t.admin.reviews} />}>
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
            <EmptyState title={t.creator.noReviews} icon="chatbubble-ellipses-outline" />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowTop}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.fg, fontWeight: "700" }}>{item.author.name} → @{item.creator.username}</Text>
                <Text style={{ color: palette.accent }}>★ {item.rating}</Text>
              </View>
              <Pressable
                onPress={async () => {
                  const ok = await confirm({ title: t.common.delete, destructive: true });
                  if (ok) del.mutate(item.id);
                }}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={20} color={palette.danger} />
              </Pressable>
            </View>
            {item.body ? <Text style={{ color: palette.fg }}>{item.body}</Text> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
