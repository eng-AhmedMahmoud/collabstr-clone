import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useCreatorByUsername, useSavedCreators, useReviewsByCreator } from "@/api/queries";
import { useToggleSaveCreator, useOpenThread } from "@/api/mutations";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";
import { useToast } from "@/components/Toast";

export default function CreatorDetailScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { me } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const q = useCreatorByUsername(username as string);
  const saved = useSavedCreators({ enabled: !!me });
  const reviews = useReviewsByCreator(q.data?.id ?? "");
  const toggleSave = useToggleSaveCreator();
  const openThread = useOpenThread();

  const isSaved = useMemo(
    () => saved.data?.some((c) => c.id === q.data?.id) ?? false,
    [saved.data, q.data?.id],
  );

  const onSave = () => {
    if (!me) { router.push("/(auth)/login"); return; }
    if (!q.data) return;
    toggleSave.mutate(q.data.id);
  };

  const onMessage = async () => {
    if (!me) { router.push("/(auth)/login"); return; }
    try {
      const res = await openThread.mutateAsync(username as string);
      router.push(`/messages/${res.id}`);
    } catch { toast(t.common.error, "error"); }
  };

  const header = <AppHeader title={`@${username ?? ""}`} />;

  if (q.isLoading) {
    return (
      <Screen padded={false} header={header}>
        <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
      </Screen>
    );
  }
  if (q.error || !q.data) {
    return (
      <Screen padded header={header}>
        <Text style={{ color: palette.danger }}>{t.common.error}</Text>
        <Button title={t.common.retry} onPress={() => q.refetch()} />
      </Screen>
    );
  }

  const d = q.data;
  const followers = Math.max(d.followersIg, d.followersTt, d.followersYt);

  return (
    <Screen scroll padded header={header}>
      <View style={[styles.head, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Avatar uri={d.user.avatarUrl} seed={d.username} size={96} />
        <Text style={[styles.name, { color: palette.fg }]}>{d.user.name}</Text>
        <Text style={[styles.headline, { color: palette.fgMuted }]}>{d.headline}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={palette.fgMuted} />
          <Text style={[styles.meta, { color: palette.fgMuted }]}>{d.city}, {d.country}</Text>
        </View>
        {d.mawthooqStatus === "verified" ? (
          <View style={{ marginTop: 6 }}>
            <Badge label={t.discover.verified} tone="brand" />
          </View>
        ) : null}
        <View style={styles.stats}>
          <Stat label="★" value={d.rating.toFixed(1)} color={palette.accent} palette={palette} />
          <Stat label={t.creator.reviews} value={String(d.reviewsCount)} palette={palette} />
          {followers > 0 ? <Stat label={t.discover.followers} value={formatFollowers(followers)} palette={palette} /> : null}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, alignSelf: "stretch" }}>
          <Button
            title={isSaved ? t.creator.unsaveCta : t.creator.saveCta}
            variant="outline"
            onPress={onSave}
            loading={toggleSave.isPending}
            style={{ flex: 1 }}
          />
          <Button
            title={t.creator.messageCta}
            onPress={onMessage}
            loading={openThread.isPending}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.creator.packages}</Text>
      {d.packages.length === 0 ? (
        <Text style={{ color: palette.fgMuted }}>{t.creator.noPackages}</Text>
      ) : (
        d.packages.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              if (!me) { router.push("/(auth)/login"); return; }
              router.push(`/checkout?creator=${d.username}&package=${p.id}`);
            }}
            style={({ pressed }) => [styles.pkg, { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.pkgTitle, { color: palette.fg }]}>{p.title}</Text>
              {p.description ? <Text style={[styles.pkgDesc, { color: palette.fgMuted }]} numberOfLines={3}>{p.description}</Text> : null}
            </View>
            <Text style={[styles.pkgPrice, { color: palette.brand }]}>{p.price} {t.discover.sar}</Text>
          </Pressable>
        ))
      )}

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.creator.reviews}</Text>
      {reviews.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : (reviews.data?.length ?? 0) === 0 ? (
        <EmptyState title={t.creator.noReviews} icon="star-outline" />
      ) : (
        reviews.data!.map((r) => (
          <View key={r.id} style={[styles.review, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.reviewHead}>
              <Avatar uri={r.author.avatarUrl} seed={r.author.name} size={32} />
              <Text style={[styles.reviewName, { color: palette.fg }]}>{r.author.name}</Text>
              <Text style={[styles.reviewRating, { color: palette.accent }]}>★ {r.rating}</Text>
            </View>
            {r.body ? <Text style={[styles.reviewBody, { color: palette.fg }]}>{r.body}</Text> : null}
          </View>
        ))
      )}

      {d.bio ? (
        <>
          <Text style={[styles.section, { color: palette.fgMuted }]}>{t.creator.about}</Text>
          <Text style={[styles.bio, { color: palette.fg }]}>{d.bio}</Text>
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value, color, palette }: { label: string; value: string; color?: string; palette: any }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color: color ?? palette.fg }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: palette.fgMuted }]}>{label}</Text>
    </View>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  head: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: "center", gap: 6 },
  name: { fontSize: 22, fontWeight: "800", marginTop: spacing.sm },
  headline: { fontSize: 14, textAlign: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  meta: { fontSize: 13 },
  stats: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  statCell: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  section: { fontSize: 12, fontWeight: "700", marginTop: spacing.lg, textTransform: "uppercase" },
  pkg: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pkgTitle: { fontSize: 15, fontWeight: "700" },
  pkgDesc: { fontSize: 12, marginTop: 2 },
  pkgPrice: { fontSize: 16, fontWeight: "800" },
  review: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reviewName: { fontSize: 14, fontWeight: "700", flex: 1 },
  reviewRating: { fontSize: 14, fontWeight: "700" },
  reviewBody: { fontSize: 13 },
  bio: { fontSize: 15, lineHeight: 22 },
});
