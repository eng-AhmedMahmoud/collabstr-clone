import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { qk, useThreadMessages, type ChatMessage } from "@/api/queries";
import { useMarkThreadRead, useSendMessage } from "@/api/mutations";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

// The realtime `message:new` payload and the `message:send` ack are the raw
// Prisma message row (it carries threadId, unlike the mapped ChatMessage).
type IncomingMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

function isIncoming(v: unknown): v is IncomingMessage {
  return !!v && typeof v === "object" && "id" in v && "threadId" in v && "body" in v;
}

export default function ThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const tid = threadId as string;
  const { palette } = useTheme();
  const { t } = useI18n();
  const { me } = useAuth();
  const myId = me?.id;
  const qc = useQueryClient();
  const q = useThreadMessages(tid);
  const send = useSendMessage(tid);
  const markRead = useMarkThreadRead(tid);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();

  // Screen's SafeAreaView skips the bottom edge (tab screens get it from the
  // tab bar, which this screen doesn't have), so the composer must clear the
  // home indicator itself — except while the keyboard is up, when
  // KeyboardAvoidingView already lifts it.
  const [kbOpen, setKbOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKbOpen(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKbOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Mark the thread read on open, and again whenever new messages arrive
  // while the screen stays open (the query polls every 8s as a fallback).
  const msgCount = q.data?.length ?? 0;
  const lastMarkedCount = useRef(-1);
  useEffect(() => {
    if (!tid) return;
    if (lastMarkedCount.current === -1 || msgCount > lastMarkedCount.current) {
      lastMarkedCount.current = msgCount;
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid, msgCount]);

  useEffect(() => {
    if ((q.data?.length ?? 0) > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [q.data?.length]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  // Join the thread room, append incoming messages straight into the query
  // cache (deduped by id), and mark read as they land. The 8s poll above stays
  // as a fallback for when the socket is down.
  useEffect(() => {
    if (!tid) return;
    const socket = getSocket();

    const appendToCache = (raw: IncomingMessage) => {
      if (raw.threadId !== tid) return;
      const mapped: ChatMessage = {
        id: raw.id,
        body: raw.body,
        createdAt: raw.createdAt,
        senderId: raw.senderId,
        fromMe: raw.senderId === myId,
      };
      qc.setQueryData<ChatMessage[]>(qk.messages(tid), (prev) => {
        const list = prev ?? [];
        if (list.some((m) => m.id === mapped.id)) return list;
        return [...list, mapped];
      });
    };

    const join = () => {
      socket.emit("thread:join", { threadId: tid });
      socket.emit("thread:read", { threadId: tid });
    };

    const onNew = (raw: unknown) => {
      if (!isIncoming(raw) || raw.threadId !== tid) return;
      appendToCache(raw);
      qc.invalidateQueries({ queryKey: qk.threads() });
      // Someone else's message just arrived while we're looking at it → read.
      if (raw.senderId !== myId) socket.emit("thread:read", { threadId: tid });
    };

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("message:new", onNew);

    return () => {
      socket.off("connect", join);
      socket.off("message:new", onNew);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid, myId]);

  const appendMine = (raw: IncomingMessage) => {
    if (raw.threadId !== tid) return;
    qc.setQueryData<ChatMessage[]>(qk.messages(tid), (prev) => {
      const list = prev ?? [];
      if (list.some((m) => m.id === raw.id)) return list;
      return [...list, { id: raw.id, body: raw.body, createdAt: raw.createdAt, senderId: raw.senderId, fromMe: raw.senderId === myId }];
    });
  };

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    const socket = getSocket();
    if (socket.connected) {
      // Ack returns the persisted message; the server also broadcasts
      // `message:new` to us (we're in the room), so onNew dedupes either way.
      // Fall back to HTTP only when the socket can't deliver it.
      socket.emit("message:send", { threadId: tid, body }, (ack: unknown) => {
        if (isIncoming(ack)) appendMine(ack);
        else send.mutate(body);
      });
    } else {
      try { await send.mutateAsync(body); } catch { /* ignore */ }
    }
  };

  return (
    <Screen padded={false} keyboard header={<AppHeader title={t.messages.title} />}>
      {q.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
      ) : q.isError ? (
        <View style={[styles.center, { gap: spacing.md, padding: spacing.lg }]}>
          <Text style={{ color: palette.danger, textAlign: "center" }}>{t.common.error}</Text>
          <Button title={t.common.retry} variant="outline" onPress={() => q.refetch()} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={q.data ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<EmptyState title={t.messages.empty} icon="chatbubble-outline" />}
          renderItem={({ item }) => <Bubble msg={item} />}
        />
      )}
      <View
        style={[
          styles.composerWrap,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            paddingBottom: kbOpen ? spacing.sm : Math.max(insets.bottom, spacing.sm),
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t.messages.placeholder}
          placeholderTextColor={palette.fgMuted}
          multiline
          style={[styles.input, { color: palette.fg }]}
        />
        <Pressable
          onPress={submit}
          disabled={send.isPending || !text.trim()}
          style={({ pressed }) => [styles.sendBtn, { backgroundColor: palette.brand, opacity: !text.trim() ? 0.4 : pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </Screen>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const { palette } = useTheme();
  const { isRTL } = useI18n();
  const mine = msg.fromMe;
  return (
    <View style={[styles.bubbleRow, { alignItems: mine ? "flex-end" : "flex-start" }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? palette.brand : palette.card,
            borderColor: mine ? palette.brand : palette.border,
            borderTopStartRadius: mine ? radius.lg : 4,
            borderTopEndRadius: mine ? 4 : radius.lg,
          },
        ]}
      >
        <Text style={{ color: mine ? "#fff" : palette.fg, fontSize: 14, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }}>{msg.body}</Text>
      </View>
      <Text style={[styles.time, { color: palette.fgMuted }]}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { gap: 2, marginBottom: spacing.xs },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  time: { fontSize: 10 },
  composerWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
