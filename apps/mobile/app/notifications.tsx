import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { useNotifications } from "@/api/queries";
import { useMarkAllNotificationsRead } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { mapNotificationHref } from "@/linking";
import { radius, spacing } from "@/theme";

export default function Notifications() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  const hasUnread = q.data?.some((n) => !n.read) ?? false;
  const right = hasUnread ? (
    <Pressable onPress={() => markAll.mutate()} style={{ paddingHorizontal: 8 }}>
      <Text style={{ color: palette.brand, fontWeight: "700" }}>{t.notifications.markAll}</Text>
    </Pressable>
  ) : null;

  return (
    <Screen padded={false} header={<AppHeader title={t.notifications.title} right={right} />}>
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
            <EmptyState title={t.notifications.empty} icon="notifications-outline" />
          )
        }
        renderItem={({ item }) => {
          const href = mapNotificationHref(item.href);
          return (
            <Pressable
              disabled={!href}
              onPress={() => { if (href) router.push(href as never); }}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: palette.card, borderColor: palette.border, opacity: item.read ? 0.7 : pressed ? 0.9 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: palette.fg }]}>{item.title}</Text>
                <Text style={[styles.body, { color: palette.fgMuted }]}>{item.body}</Text>
                <Text style={[styles.time, { color: palette.fgMuted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              {!item.read ? <View style={[styles.dot, { backgroundColor: palette.brand }]} /> : null}
            </Pressable>
          );
        }}
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
  title: { fontSize: 15, fontWeight: "700" },
  body: { fontSize: 13, marginTop: 2 },
  time: { fontSize: 11, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 999 },
});
