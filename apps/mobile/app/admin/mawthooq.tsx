import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { EmptyState } from "@/components/EmptyState";
import { useAdminMawthooq } from "@/api/queries";
import { useReviewMawthooq } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";
import { spacing } from "@/theme";

export default function AdminMawthooq() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const q = useAdminMawthooq();

  return (
    <Screen padded={false} header={<AppHeader title={t.admin.mawthooq} />}>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(it) => it.creatorId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={{ padding: spacing.xxl, alignItems: "center" }}><ActivityIndicator color={palette.brand} /></View>
          ) : (
            <EmptyState title={t.common.empty} icon="shield-checkmark-outline" />
          )
        }
        renderItem={({ item }) => <ReviewRow row={item} />}
      />
    </Screen>
  );
}

function ReviewRow({ row }: { row: any }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const review = useReviewMawthooq(row.creatorId);
  const [note, setNote] = useState("");
  const [expires, setExpires] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const decide = async (decision: "verified" | "rejected") => {
    const next: Record<string, string> = {};
    if (decision === "verified" && !expires.trim()) next.expires = t.errors.required;
    if (expires.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(expires.trim())) next.expires = t.errors.invalidDate;
    if (decision === "rejected" && !note.trim()) next.note = t.errors.reasonRequired;
    if (Object.keys(next).length) {
      setErrors(next);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError(null);
    try {
      await review.mutateAsync({
        decision,
        note: note || undefined,
        expiresAt: expires ? new Date(expires).toISOString() : undefined,
      });
      toast(t.common.done, "success");
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(err, t));
    }
  };

  return (
    <Card>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.fg, fontWeight: "700" }}>{row.name}</Text>
          <Text style={{ color: palette.fgMuted, fontSize: 12 }}>@{row.username}</Text>
        </View>
        <Badge label={row.status} tone={row.status === "verified" ? "success" : "brand"} />
      </View>
      <Text style={{ color: palette.fg }}>
        <Text style={{ color: palette.fgMuted }}>{t.admin.licenceNo}:</Text> {row.licenseNo}
      </Text>
      <TextField label={t.admin.expiresAt} value={expires} onChangeText={setExpires} placeholder="YYYY-MM-DD" autoCapitalize="none" error={errors.expires} />
      <TextField label={t.admin.note} value={note} onChangeText={setNote} multiline error={errors.note} />
      {formError ? <Text style={{ color: palette.danger, fontSize: 12 }}>{formError}</Text> : null}
      <View style={{ flexDirection: "row", gap: spacing.xs }}>
        <Button title={t.admin.approve} onPress={() => decide("verified")} loading={review.isPending} style={{ flex: 1 }} />
        <Button title={t.admin.reject} variant="outline" onPress={() => decide("rejected")} loading={review.isPending} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
