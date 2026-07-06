import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/Money";
import { useCreatorMe, useMyOrders } from "@/api/queries";
import { useSubmitMawthooq } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { spacing } from "@/theme";

export default function CreatorDashboard() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const orders = useMyOrders("creator");
  const me = useCreatorMe();
  const submitMaw = useSubmitMawthooq();

  const [licenseNo, setLicenseNo] = useState("");

  const earnings = useMemo(
    () => (orders.data ?? []).filter((o) => o.status === "released").reduce((sum, o) => sum + o.total, 0),
    [orders.data],
  );
  const status = me.data?.mawthooqStatus ?? "none";

  const submitLic = async () => {
    try {
      await submitMaw.mutateAsync({ licenseNo: licenseNo.trim() });
      toast(t.dashboard.mawthooqPending, "success");
      setLicenseNo("");
    } catch { toast(t.common.error, "error"); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.dashboard.creatorTitle} />}>
      <View style={styles.statsRow}>
        <StatCard label={t.dashboard.kpiOrders} value={String(orders.data?.length ?? 0)} />
        <StatCard label={t.dashboard.kpiEarnings} value={String(earnings)} money />
      </View>
      <View style={styles.statsRow}>
        <StatCard label={t.dashboard.kpiRating} value={(me.data?.rating ?? 0).toFixed(1)} />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={[styles.h, { color: palette.fg }]}>{t.dashboard.mawthooq}</Text>
          <Badge
            label={
              status === "verified" ? t.dashboard.mawthooqVerified :
              status === "pending" ? t.dashboard.mawthooqPending :
              status === "rejected" ? t.dashboard.mawthooqRejected :
              t.common.optional
            }
            tone={status === "verified" ? "success" : status === "pending" ? "brand" : status === "rejected" ? "danger" : "neutral"}
          />
        </View>
        {status === "none" || status === "rejected" ? (
          <>
            <Text style={{ color: palette.fgMuted }}>{t.dashboard.mawthooqPrompt}</Text>
            <TextField label={t.dashboard.licenseNo} value={licenseNo} onChangeText={setLicenseNo} autoCapitalize="characters" />
            <Button title={t.dashboard.submitLicence} onPress={submitLic} loading={submitMaw.isPending} disabled={!licenseNo} />
          </>
        ) : null}
      </Card>

      <Button title={t.settings.packages} variant="outline" onPress={() => router.push("/dashboard/packages")} />

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.recentOrders}</Text>
      {orders.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : (orders.data?.length ?? 0) === 0 ? (
        <EmptyState title={t.orders.empty} icon="receipt-outline" />
      ) : (
        orders.data!.slice(0, 5).map((o) => (
          <Pressable key={o.id} onPress={() => router.push(`/orders/${o.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={{ color: palette.fg, fontWeight: "700" }} numberOfLines={1}>{o.package.title}</Text>
                <Badge label={t.status[o.status]} tone="brand" />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{o.brand.name} · </Text>
                <Money value={o.total} style={{ color: palette.fgMuted, fontSize: 12 }} />
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: spacing.sm },
  section: { fontSize: 12, textTransform: "uppercase", fontWeight: "700", marginTop: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  h: { fontSize: 15, fontWeight: "800" },
});
