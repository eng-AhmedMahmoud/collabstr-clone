import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Money } from "@/components/Money";
import { useOrderById } from "@/api/queries";
import {
  useOrderAction,
  useSubmitDeliverable,
  useRequestRevision,
  useDisputeOrder,
  useLeaveReview,
} from "@/api/mutations";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";
import { useConfirm } from "@/components/useConfirm";
import { radius, spacing } from "@/theme";
import type { OrderStatus } from "@collabstr/shared-types";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const q = useOrderById(id as string);

  const isBrand = me?.role === "brand";
  const isCreator = me?.role === "creator";

  const pay = useOrderAction(id as string, "pay");
  const accept = useOrderAction(id as string, "accept");
  const approve = useOrderAction(id as string, "approve");
  const release = useOrderAction(id as string, "release");
  const cancel = useOrderAction(id as string, "cancel");
  const submitDeliv = useSubmitDeliverable(id as string);
  const revision = useRequestRevision(id as string);
  const dispute = useDisputeOrder(id as string);
  const leaveReview = useLeaveReview(id as string);

  const [delivUrl, setDelivUrl] = useState("");
  const [delivNote, setDelivNote] = useState("");
  const [revNote, setRevNote] = useState("");
  const [dispReason, setDispReason] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        <Button title={t.common.retry} onPress={() => q.refetch()} />
      </Screen>
    );
  }

  const d = q.data;
  const status = d.status as OrderStatus;

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast(label, "success");
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (fe) setErrors((prev) => ({ ...prev, ...fe }));
      toast(apiErrorMessage(err, t), "error");
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={`${t.orders.detailTitle} #${d.id.slice(-6)}`} />}>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={[styles.title, { color: palette.fg }]}>{d.package.title}</Text>
          <Badge label={t.status[status]} tone={statusTone(status)} />
        </View>
        <View style={styles.metaRow}>
          <Text style={{ color: palette.fgMuted }}>{t.orders.total}</Text>
          <Money value={d.total} style={[styles.strong, { color: palette.brand }]} />
        </View>
        <View style={styles.peerRow}>
          <Avatar uri={d.creator.user.avatarUrl} seed={d.creator.username} size={32} />
          <Text style={{ color: palette.fg }}>{d.creator.user.name} · @{d.creator.username}</Text>
        </View>
        <View style={styles.peerRow}>
          <Avatar uri={d.brand.avatarUrl} seed={d.brand.name} size={32} />
          <Text style={{ color: palette.fg }}>{d.brand.name}</Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.brief}</Text>
        <Text style={{ color: palette.fg }}>{d.brief}</Text>
        {d.deadline ? (
          <>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.deadline}</Text>
            <Text style={{ color: palette.fg }}>{new Date(d.deadline).toLocaleDateString()}</Text>
          </>
        ) : null}
        {d.deliverableUrl ? (
          <>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.submitUrl}</Text>
            <Text style={{ color: palette.brand }}>{d.deliverableUrl}</Text>
            {d.deliverableNote ? <Text style={{ color: palette.fgMuted }}>{d.deliverableNote}</Text> : null}
          </>
        ) : null}
      </Card>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.actions}</Text>
      <View style={{ gap: spacing.sm }}>
        {isBrand && status === "pending_payment" ? (
          <Button title={t.orders.pay} onPress={() => run(t.orders.pay, () => pay.mutateAsync())} loading={pay.isPending} />
        ) : null}
        {isCreator && status === "awaiting_creator" ? (
          <Button title={t.orders.accept} onPress={() => run(t.orders.accept, () => accept.mutateAsync())} loading={accept.isPending} />
        ) : null}
        {isCreator && (status === "in_progress" || status === "revision_requested") ? (
          <Card>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.submit}</Text>
            <TextField label={t.orders.submitUrl} value={delivUrl} onChangeText={setDelivUrl} autoCapitalize="none" error={errors.delivUrl} />
            <TextField label={t.orders.submitNote} value={delivNote} onChangeText={setDelivNote} multiline />
            <Button
              title={t.orders.submit}
              onPress={() => {
                const ok = /^https?:\/\/.+/i.test(delivUrl.trim());
                setErrors((prev) => ({ ...prev, delivUrl: ok ? "" : t.errors.urlInvalid }));
                if (!ok) return;
                run(t.orders.submit, () => submitDeliv.mutateAsync({ url: delivUrl, note: delivNote || undefined }));
              }}
              loading={submitDeliv.isPending}
              disabled={!delivUrl}
            />
          </Card>
        ) : null}
        {isBrand && status === "submitted" ? (
          <>
            <Card>
              <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.revision}</Text>
              <TextField label={t.orders.revisionNote} value={revNote} onChangeText={setRevNote} multiline error={errors.revNote} />
              <Button
                title={t.orders.revision}
                variant="outline"
                onPress={() => {
                  const ok = revNote.trim().length > 0;
                  setErrors((prev) => ({ ...prev, revNote: ok ? "" : t.errors.reasonRequired }));
                  if (!ok) return;
                  run(t.orders.revision, () => revision.mutateAsync({ note: revNote }));
                }}
                loading={revision.isPending}
                disabled={!revNote}
              />
            </Card>
            <Button title={t.orders.approve} onPress={() => run(t.orders.approve, () => approve.mutateAsync())} loading={approve.isPending} />
          </>
        ) : null}
        {isBrand && status === "approved" ? (
          <Button title={t.orders.release} onPress={() => run(t.orders.release, () => release.mutateAsync())} loading={release.isPending} />
        ) : null}
        {(status === "pending_payment" || status === "awaiting_creator" || status === "in_progress") ? (
          <Button
            title={t.orders.cancel}
            variant="outline"
            onPress={async () => {
              const ok = await confirm({ title: t.orders.cancel, message: t.settings.deleteAccountWarn, destructive: true });
              if (ok) run(t.orders.cancel, () => cancel.mutateAsync());
            }}
            loading={cancel.isPending}
          />
        ) : null}
        {status !== "released" && status !== "cancelled" && status !== "disputed" ? (
          <Card>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.dispute}</Text>
            <TextField label={t.orders.disputeReason} value={dispReason} onChangeText={setDispReason} multiline error={errors.dispReason} />
            <Button
              title={t.orders.dispute}
              variant="outline"
              onPress={() => {
                const ok = dispReason.trim().length > 0;
                setErrors((prev) => ({ ...prev, dispReason: ok ? "" : t.errors.reasonRequired }));
                if (!ok) return;
                run(t.orders.dispute, () => dispute.mutateAsync({ reason: dispReason }));
              }}
              loading={dispute.isPending}
              disabled={!dispReason}
            />
          </Card>
        ) : null}
        {isBrand && (status === "released" || status === "approved") ? (
          <Card>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.creator.reviews}</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= reviewRating ? "star" : "star-outline"}
                  size={26}
                  color={palette.accent}
                  onPress={() => setReviewRating(n)}
                />
              ))}
            </View>
            {errors.rating ? <Text style={[styles.fieldError, { color: palette.danger }]}>{errors.rating}</Text> : null}
            <TextField label={t.creator.reviews} value={reviewText} onChangeText={setReviewText} multiline error={errors.review} />
            <Button
              title={t.common.submit}
              onPress={() => {
                const next: Record<string, string> = {};
                if (reviewRating < 1) next.rating = t.errors.ratingRequired;
                if (reviewText.trim().length < 10) next.review = t.errors.reviewMin;
                setErrors((prev) => ({ ...prev, rating: next.rating ?? "", review: next.review ?? "" }));
                if (Object.keys(next).length) return;
                run(t.common.submit, () => leaveReview.mutateAsync({ rating: reviewRating, text: reviewText }));
              }}
              loading={leaveReview.isPending}
              disabled={!reviewText}
            />
          </Card>
        ) : null}
      </View>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.timeline}</Text>
      {d.timeline.map((e) => (
        <View key={e.id} style={[styles.timelineRow, { borderColor: palette.border }]}>
          <View style={[styles.dot, { backgroundColor: palette.brand }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.fg, fontWeight: "700" }}>{e.action}</Text>
            <Text style={{ color: palette.fgMuted, fontSize: 12 }}>
              {new Date(e.at).toLocaleString()} · {e.actor}
            </Text>
            {e.note ? <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{e.note}</Text> : null}
          </View>
        </View>
      ))}
    </Screen>
  );
}

function statusTone(s: OrderStatus): "brand" | "success" | "danger" | "neutral" | "accent" {
  if (s === "released" || s === "approved") return "success";
  if (s === "disputed") return "danger";
  if (s === "cancelled") return "neutral";
  if (s === "revision_requested") return "accent";
  return "brand";
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", flex: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  strong: { fontSize: 15, fontWeight: "700" },
  peerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  fieldError: { fontSize: 12 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  dot: { width: 10, height: 10, borderRadius: 999, marginTop: 6 },
});
