import { useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Money } from "@/components/Money";
import { useCampaignById } from "@/api/queries";
import { useApplyToCampaign, useUpdateCampaignStatus } from "@/api/mutations";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";
import { spacing } from "@/theme";

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const q = useCampaignById(id as string);
  const apply = useApplyToCampaign(id as string);
  const updateStatus = useUpdateCampaignStatus(id as string);

  const [price, setPrice] = useState("");
  const [pitch, setPitch] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (q.isLoading) {
    return (
      <Screen padded={false} header={<AppHeader title={t.campaigns.detailTitle} />}>
        <View style={styles.center}><ActivityIndicator color={palette.brand} /></View>
      </Screen>
    );
  }
  if (q.error || !q.data) {
    return (
      <Screen padded header={<AppHeader title={t.campaigns.detailTitle} />}>
        <Text style={{ color: palette.danger }}>{t.common.error}</Text>
      </Screen>
    );
  }

  const c = q.data;
  const isOwner = me?.role === "brand" && me.id === c.brandId;
  const canApply = me?.role === "creator" && c.status === "open";

  const submitApply = async () => {
    const p = Number(price);
    const next: Record<string, string> = {};
    if (!price.trim() || !Number.isInteger(p)) next.price = t.errors.priceInt;
    else if (p < 10) next.price = t.errors.priceMin;
    if (pitch.trim().length < 20) next.pitch = t.errors.pitchMin;
    if (Object.keys(next).length) {
      setErrors(next);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError(null);
    try {
      await apply.mutateAsync({ price: p, pitch });
      toast(t.campaigns.apply.applied, "success");
      setShowApply(false);
      setPrice("");
      setPitch("");
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(err, t));
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.campaigns.detailTitle} />}>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
          <Text style={[styles.title, { color: palette.fg }]}>{c.title}</Text>
          <Badge label={t.campaigns.status[c.status]} tone={c.status === "open" ? "success" : c.status === "closed" ? "neutral" : "accent"} />
        </View>
        <Text style={{ color: palette.fgMuted }}>{c.brand.name}</Text>
        <Text style={{ color: palette.fg, marginTop: spacing.sm }}>{c.description}</Text>
      </Card>

      <Card>
        <Row
          label={t.campaigns.budget}
          palette={palette}
          valueNode={
            <View style={styles.budgetRow}>
              <Money value={c.budgetMin} style={styles.budgetText} color={palette.fg} />
              <Text style={[styles.budgetText, { color: palette.fg }]}> — </Text>
              <Money value={c.budgetMax} style={styles.budgetText} color={palette.fg} />
            </View>
          }
        />
        <Row label={t.campaigns.platforms} value={c.platforms.join(", ")} palette={palette} />
        <Row label={t.campaigns.categories} value={c.categories.join(", ")} palette={palette} />
        {c.deadline ? <Row label={t.campaigns.deadline} value={new Date(c.deadline).toLocaleDateString()} palette={palette} /> : null}
        {c.creatorsNeeded ? <Row label={t.campaigns.creatorsNeeded} value={String(c.creatorsNeeded)} palette={palette} /> : null}
      </Card>

      {canApply && !showApply ? (
        <Button title={t.campaigns.applyCta} onPress={() => setShowApply(true)} />
      ) : null}
      {canApply && showApply ? (
        <Card>
          <Text style={[styles.section, { color: palette.fgMuted }]}>{t.campaigns.applyTitle}</Text>
          <TextField label={t.campaigns.price} value={price} onChangeText={setPrice} keyboardType="numeric" error={errors.price} />
          <TextField label={t.campaigns.pitch} value={pitch} onChangeText={setPitch} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: "top" }} error={errors.pitch} />
          {formError ? <Text style={{ color: palette.danger }}>{formError}</Text> : null}
          <Button title={t.common.submit} onPress={submitApply} loading={apply.isPending} disabled={!price || !pitch} />
          <Button title={t.common.cancel} variant="ghost" onPress={() => setShowApply(false)} />
        </Card>
      ) : null}

      {isOwner ? (
        <Card>
          <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.status}</Text>
          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            <Chip label={t.campaigns.status.open} active={c.status === "open"} onPress={() => updateStatus.mutate("open")} />
            <Chip label={t.campaigns.status.closed} active={c.status === "closed"} onPress={() => updateStatus.mutate("closed")} />
            <Chip label={t.campaigns.status.draft} active={c.status === "draft"} onPress={() => updateStatus.mutate("draft")} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

function Row({
  label,
  value,
  valueNode,
  palette,
}: {
  label: string;
  value?: string;
  valueNode?: ReactNode;
  palette: any;
}) {
  return (
    <View style={styles.rowBetween}>
      <Text style={{ color: palette.fgMuted }}>{label}</Text>
      {valueNode ?? <Text style={{ color: palette.fg, fontWeight: "700" }}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", flex: 1 },
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  budgetRow: { flexDirection: "row", alignItems: "center" },
  budgetText: { fontWeight: "700" },
});
