import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/Money";
import { useSavedCreators } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

export default function Saved() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useSavedCreators();

  return (
    <Screen padded={false} header={<AppHeader title={t.saved.title} />}>
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
          ) : (
            <EmptyState title={t.saved.empty} icon="bookmark-outline" />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/creator/${item.username}`)}
            style={({ pressed }) => [styles.row, { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 }]}
          >
            <Avatar uri={item.user.avatarUrl} seed={item.username} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: palette.fg }]}>{item.user.name}</Text>
              <Text style={[styles.meta, { color: palette.fgMuted }]}>{item.city} · @{item.username}</Text>
            </View>
            {item.startingPrice ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Text style={{ color: palette.brand, fontWeight: "700" }}>{t.discover.from}</Text>
                <Money value={item.startingPrice} style={{ color: palette.brand, fontWeight: "700" }} />
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
