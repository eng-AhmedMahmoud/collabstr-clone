import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useAdminCampaigns } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function AdminCampaigns() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useAdminCampaigns();
  return (
    <Screen padded={false} header={<AppHeader title={t.admin.campaigns} />}>
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
            <EmptyState title={t.campaigns.empty} icon="megaphone-outline" />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/campaigns/${item.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{item.title}</Text>
                <Badge label={t.campaigns.status[item.status]} tone={item.status === "open" ? "success" : "neutral"} />
              </View>
              <Text style={{ color: palette.fgMuted, fontSize: 12 }} numberOfLines={2}>{item.brand.name} · {item.budgetMin}-{item.budgetMax} {t.discover.sar}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
});
