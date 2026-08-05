import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Badge } from "@/components/Badge";
import { qk, useNotifications, useThreads, type NotificationItem, type Thread } from "@/api/queries";
import { useMarkAllNotificationsRead } from "@/api/mutations";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { mapNotificationHref } from "@/linking";
import { radius, spacing } from "@/theme";
import { Button } from "@/components/Button";

type Tab = "messages" | "notifications";

export default function Inbox() {
  const { me } = useAuth();
  const { palette } = useTheme();
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("messages");

  if (!me) {
    return (
      <Screen padded>
        <View style={{ paddingVertical: spacing.xxl }}>
          <EmptyState
            title={t.profile.guestTitle}
            subtitle={t.profile.guestSubtitle}
            icon="chatbubbles-outline"
            action={<Button title={t.profile.goLogin} onPress={() => router.push("/(auth)/login")} />}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerBar}>
        <Text style={[styles.title, { color: palette.fg, textAlign: isRTL ? "right" : "left" }]}>{t.tabs.inbox}</Text>
      </View>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SegmentedControl
          options={[
            { value: "messages", label: t.notifications.inboxTab },
            { value: "notifications", label: t.notifications.notifTab },
          ] as const}
          value={tab}
          onChange={setTab}
        />
      </View>
      {tab === "messages" ? <MessagesList /> : <NotificationsList />}
    </Screen>
  );
}

function MessagesList() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const q = useThreads();
  const qc = useQueryClient();

  // Realtime nudge: any message on any of my threads refreshes the list.
  // The thread query has no poll of its own, so this is the live path.
  useEffect(() => {
    const socket = getSocket();
    const onUpdated = () => qc.invalidateQueries({ queryKey: qk.threads() });
    socket.on("thread:updated", onUpdated);
    return () => {
      socket.off("thread:updated", onUpdated);
    };
  }, [qc]);

  return (
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
          <EmptyState title={t.messages.empty} icon="chatbubbles-outline" />
        )
      }
      renderItem={({ item }) => (
        <ThreadRow item={item} onPress={() => router.push(`/messages/${item.id}`)} />
      )}
    />
  );
}

function ThreadRow({ item, onPress }: { item: Thread; onPress: () => void }) {
  const { palette } = useTheme();
  const { isRTL } = useI18n();
  const align = isRTL ? "right" : "left";
  // Defensive: the mapping in useThreads always supplies a peer, but guard
  // anyway so a malformed row can never crash the whole inbox list.
  const peer = item.peer ?? { id: item.id, name: "", avatarUrl: null, username: null };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Avatar uri={peer.avatarUrl} seed={peer.username ?? peer.id} size={44} />
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, { color: palette.fg, textAlign: align }]} numberOfLines={1}>{peer.name}</Text>
          {item.unread > 0 ? <Badge label={String(item.unread)} tone="brand" /> : null}
        </View>
        {item.lastMessage ? (
          <Text style={[styles.preview, { color: palette.fgMuted, textAlign: align }]} numberOfLines={1}>
            {item.lastMessage.body}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function NotificationsList() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  return (
    <FlatList
      data={q.data ?? []}
      keyExtractor={(it) => it.id}
      refreshing={q.isRefetching}
      onRefresh={() => q.refetch()}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListHeaderComponent={
        (q.data?.some((n) => !n.read) ?? false) ? (
          <View style={{ marginBottom: spacing.sm, alignItems: "flex-end" }}>
            <Pressable
              onPress={() => markAll.mutate()}
              style={({ pressed }) => [styles.markBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={{ color: palette.brand, fontWeight: "700", fontSize: 13 }}>
                {t.notifications.markAll}
              </Text>
            </Pressable>
          </View>
        ) : null
      }
      ListEmptyComponent={
        q.isLoading ? (
          <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
        ) : (
          <EmptyState title={t.notifications.empty} icon="notifications-outline" />
        )
      }
      renderItem={({ item }) => <NotifRow item={item} />}
    />
  );
}

function NotifRow({ item }: { item: NotificationItem }) {
  const { palette } = useTheme();
  const { isRTL } = useI18n();
  const align = isRTL ? "right" : "left";
  const router = useRouter();
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
        <Text style={[styles.name, { color: palette.fg, textAlign: align }]}>{item.title}</Text>
        <Text style={[styles.preview, { color: palette.fgMuted, textAlign: align }]}>{item.body}</Text>
      </View>
      {!item.read ? <View style={[styles.dot, { backgroundColor: palette.brand }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: 22, fontWeight: "800" },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: 0 },
  center: { padding: spacing.xxl, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 15, fontWeight: "700", flex: 1 },
  preview: { fontSize: 13, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  markBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
});
