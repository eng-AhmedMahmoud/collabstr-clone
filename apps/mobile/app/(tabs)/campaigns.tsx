import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/Badge";
import { RoleGate } from "@/components/RoleGate";
import { useCampaigns, type CampaignListItem } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

export default function CampaignsTab() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useCampaigns();

  return (
    <Screen padded={false}>
      <View style={[styles.headerBar, { borderColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.fg }]}>{t.campaigns.title}</Text>
        <RoleGate roles={["brand"]}>
          <Pressable
            onPress={() => router.push("/campaigns/new")}
            style={({ pressed }) => [styles.newBtn, { backgroundColor: palette.brand, opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.newBtnText}>{t.campaigns.createCta}</Text>
          </Pressable>
        </RoleGate>
      </View>
      <FlatList
        data={q.data ?? []}
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
            <EmptyState title={t.campaigns.empty} icon="megaphone-outline" />
          )
        }
        renderItem={({ item }) => (
          <CampaignRow item={item} onPress={() => router.push(`/campaigns/${item.id}`)} />
        )}
      />
    </Screen>
  );
}

function CampaignRow({ item, onPress }: { item: CampaignListItem; onPress: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const tone = item.status === "open" ? "success" : item.status === "closed" ? "neutral" : "accent";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.name, { color: palette.fg }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.desc, { color: palette.fgMuted }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: palette.brand }]}>
            {item.budgetMin} — {item.budgetMax} {t.discover.sar}
          </Text>
          <Badge label={t.campaigns.status[item.status]} tone={tone as any} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 22, fontWeight: "800" },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  newBtnText: { color: "#fff", fontWeight: "700" },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { padding: spacing.xxl, alignItems: "center" },
  row: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  name: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 13 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  meta: { fontSize: 13, fontWeight: "700" },
});
