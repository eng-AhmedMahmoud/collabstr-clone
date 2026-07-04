import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { BrandMark } from "@/components/BrandMark";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useCreatorsInfinite, type CreatorListItem } from "@/api/queries";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

export default function Discover() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useMemo(() => {
    const h = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(h);
  }, [q]);

  const query = useCreatorsInfinite(debounced);
  const items: CreatorListItem[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const header = (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <BrandMark size={38} />
        <View>
          <Text style={[styles.brandName, { color: palette.fg }]}>{t.brand.name}</Text>
          <Text style={[styles.brandTag, { color: palette.fgMuted }]}>{t.brand.tagline}</Text>
        </View>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Ionicons name="search" size={18} color={palette.fgMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t.discover.searchPlaceholder}
          placeholderTextColor={palette.fgMuted}
          style={[styles.searchInput, { color: palette.fg }]}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>
      <Text style={[styles.title, { color: palette.fg }]}>{t.discover.title}</Text>
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
          ) : query.error ? (
            <View style={styles.center}><Text style={{ color: palette.danger }}>{t.common.error}</Text></View>
          ) : (
            <EmptyState title={t.common.empty} icon="search" />
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
          ) : null
        }
        renderItem={({ item }) => (
          <CreatorCard item={item} onPress={() => router.push(`/creator/${item.username}`)} />
        )}
      />
    </Screen>
  );
}

function CreatorCard({ item, onPress }: { item: CreatorListItem; onPress: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const followers = Math.max(item.followersIg, item.followersTt, item.followersYt);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Avatar uri={item.user.avatarUrl} seed={item.username} size={56} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardName, { color: palette.fg }]} numberOfLines={1}>{item.user.name}</Text>
          {item.mawthooqStatus === "verified" ? <Badge label={t.discover.verified} tone="brand" /> : null}
        </View>
        <Text style={[styles.cardHeadline, { color: palette.fgMuted }]} numberOfLines={2}>
          {item.headline}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.meta, { color: palette.fgMuted }]}>{item.city}</Text>
          {followers > 0 ? (
            <Text style={[styles.meta, { color: palette.fgMuted }]}>· {formatFollowers(followers)} {t.discover.followers}</Text>
          ) : null}
          {item.startingPrice ? (
            <Text style={[styles.price, { color: palette.brand }]}>
              {t.discover.from} {item.startingPrice} {t.discover.sar}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, gap: spacing.md },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  brandName: { fontSize: 22, fontWeight: "800" },
  brandTag: { fontSize: 13 },
  title: { fontSize: 24, fontWeight: "800", marginTop: spacing.sm },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  listContent: { paddingBottom: spacing.xxl },
  center: { padding: spacing.xxl, alignItems: "center" },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardName: { fontSize: 16, fontWeight: "700", flex: 1 },
  cardHeadline: { fontSize: 13 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4, alignItems: "center" },
  meta: { fontSize: 12 },
  price: { fontSize: 13, fontWeight: "700", marginStart: "auto" as any },
});
