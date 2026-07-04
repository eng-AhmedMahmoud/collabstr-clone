import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useAdminUsers } from "@/api/queries";
import { useAdminUserAction } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useConfirm } from "@/components/useConfirm";
import { radius, spacing } from "@/theme";

type Role = "" | "brand" | "creator" | "admin";

export default function AdminUsers() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role>("");
  const users = useAdminUsers(q, role || undefined);

  return (
    <Screen padded={false} header={<AppHeader title={t.admin.users} />}>
      <View style={styles.filters}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t.admin.searchUsers}
          placeholderTextColor={palette.fgMuted}
          style={[styles.input, { color: palette.fg, backgroundColor: palette.card, borderColor: palette.border }]}
        />
        <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
          <Chip label={t.orders.filterAll} active={!role} onPress={() => setRole("")} />
          <Chip label={t.auth.brand} active={role === "brand"} onPress={() => setRole("brand")} />
          <Chip label={t.auth.creator} active={role === "creator"} onPress={() => setRole("creator")} />
          <Chip label={t.settings.admin} active={role === "admin"} onPress={() => setRole("admin")} />
        </View>
      </View>
      <FlatList
        data={users.data ?? []}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshing={users.isRefetching}
        onRefresh={() => users.refetch()}
        ListEmptyComponent={
          users.isLoading ? (
            <View style={{ padding: spacing.xxl, alignItems: "center" }}><ActivityIndicator color={palette.brand} /></View>
          ) : (
            <EmptyState title={t.common.empty} icon="people-outline" />
          )
        }
        renderItem={({ item }) => <UserRow row={item} onConfirm={confirm} />}
      />
    </Screen>
  );
}

function UserRow({ row, onConfirm }: { row: any; onConfirm: ReturnType<typeof useConfirm> }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const ban = useAdminUserAction(row.id, "ban");
  const unban = useAdminUserAction(row.id, "unban");
  const promote = useAdminUserAction(row.id, "promote-admin");
  return (
    <Card>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{row.name}</Text>
          <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{row.email}</Text>
        </View>
        <Badge label={row.role} tone="neutral" />
        {row.banned ? <Badge label={t.admin.ban} tone="danger" /> : null}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
        {row.banned ? (
          <Button title={t.admin.unban} variant="outline" onPress={() => unban.mutate()} loading={unban.isPending} style={{ flexGrow: 1 }} />
        ) : (
          <Button
            title={t.admin.ban}
            variant="outline"
            onPress={async () => { if (await onConfirm({ title: t.admin.ban, destructive: true })) ban.mutate(); }}
            loading={ban.isPending}
            style={{ flexGrow: 1 }}
          />
        )}
        {row.role !== "admin" ? (
          <Button
            title={t.admin.promote}
            variant="outline"
            onPress={async () => { if (await onConfirm({ title: t.admin.promote })) promote.mutate(); }}
            loading={promote.isPending}
            style={{ flexGrow: 1 }}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  filters: { padding: spacing.lg, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
