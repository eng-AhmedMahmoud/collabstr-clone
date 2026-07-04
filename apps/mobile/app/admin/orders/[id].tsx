import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAdminOrderById } from "@/api/queries";
import { useAdminOrderForce } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/useConfirm";
import { spacing } from "@/theme";

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();
  const q = useAdminOrderById(id as string);
  const release = useAdminOrderForce(id as string, "force-release");
  const cancel = useAdminOrderForce(id as string, "force-cancel");
  const dispute = useAdminOrderForce(id as string, "force-dispute");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  if (q.isLoading) {
    return (
      <Screen padded={false} header={<AppHeader title={t.orders.detailTitle} />}>
        <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
      </Screen>
    );
  }
  if (q.error || !q.data) {
    return (
      <Screen padded header={<AppHeader title={t.orders.detailTitle} />}>
        <Text style={{ color: palette.danger }}>{t.common.error}</Text>
      </Screen>
    );
  }

  const d = q.data;
  const run = async (label: string, fn: () => Promise<unknown>) => {
    const ok = await confirm({ title: label, destructive: true });
    if (!ok) return;
    try { await fn(); toast(label, "success"); } catch { toast(t.common.error, "error"); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={`${t.orders.detailTitle} #${d.id.slice(-6)}`} />}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={[styles.title, { color: palette.fg }]}>{d.package.title}</Text>
          <Badge label={t.status[d.status]} tone="brand" />
        </View>
        <Text style={{ color: palette.fgMuted }}>
          {d.creator.user.name} → {d.brand.name} · {d.total} {t.discover.sar}
        </Text>
        <Text style={{ color: palette.fg, marginTop: spacing.sm }}>{d.brief}</Text>
      </Card>

      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.admin.forceRelease}</Text>
        <TextField label={t.admin.note} value={note} onChangeText={setNote} multiline />
        <Button title={t.admin.forceRelease} onPress={() => run(t.admin.forceRelease, () => release.mutateAsync({ note: note || undefined }))} loading={release.isPending} />
      </Card>

      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.admin.forceCancel}</Text>
        <TextField label={t.orders.disputeReason} value={reason} onChangeText={setReason} multiline />
        <Button title={t.admin.forceCancel} variant="outline" onPress={() => run(t.admin.forceCancel, () => cancel.mutateAsync({ reason }))} loading={cancel.isPending} disabled={!reason} />
        <Button title={t.admin.forceDispute} variant="outline" onPress={() => run(t.admin.forceDispute, () => dispute.mutateAsync({ reason }))} loading={dispute.isPending} disabled={!reason} />
      </Card>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.timeline}</Text>
      {d.timeline.map((e) => (
        <View key={e.id} style={[styles.timelineRow, { borderColor: palette.border }]}>
          <View style={[styles.dot, { backgroundColor: palette.brand }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.fg, fontWeight: "700" }}>{e.action}</Text>
            <Text style={{ color: palette.fgMuted, fontSize: 12 }}>
              {new Date(e.at).toLocaleString()} · {e.actor}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", flex: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  dot: { width: 10, height: 10, borderRadius: 999, marginTop: 6 },
});
