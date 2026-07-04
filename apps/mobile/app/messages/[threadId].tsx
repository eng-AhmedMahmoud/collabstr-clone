import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { useThreadMessages, type ChatMessage } from "@/api/queries";
import { useMarkThreadRead, useSendMessage } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

export default function ThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useThreadMessages(threadId as string);
  const send = useSendMessage(threadId as string);
  const markRead = useMarkThreadRead(threadId as string);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (threadId) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    if ((q.data?.length ?? 0) > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [q.data?.length]);

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    try { await send.mutateAsync(body); } catch { /* ignore */ }
  };

  return (
    <Screen padded={false} keyboard header={<AppHeader title={t.messages.title} />}>
      {q.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
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
      <View style={[styles.composerWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
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
        <Text style={{ color: mine ? "#fff" : palette.fg, fontSize: 14 }}>{msg.body}</Text>
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
