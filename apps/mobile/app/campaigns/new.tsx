import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Chip } from "@/components/Chip";
import { Card } from "@/components/Card";
import { useCreateCampaign } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";
import { spacing } from "@/theme";
import type { Category, Platform } from "@collabstr/shared-types";

const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "ugc"];
const CATEGORIES: Category[] = [
  "Fashion", "Beauty", "Travel", "Fitness", "Food", "Lifestyle",
  "Tech", "Gaming", "Music", "Family", "Comedy", "Pets",
];

export default function NewCampaign() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const create = useCreateCampaign();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatorsNeeded, setCreatorsNeeded] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 2) next.title = t.errors.titleMin;
    if (description.trim().length < 10) next.description = t.errors.descriptionMin;
    const bMin = Number(budgetMin);
    const bMax = Number(budgetMax);
    if (!budgetMin.trim() || !Number.isInteger(bMin) || bMin <= 0) next.budgetMin = t.errors.priceInt;
    if (!budgetMax.trim() || !Number.isInteger(bMax) || bMax <= 0) next.budgetMax = t.errors.priceInt;
    if (platforms.length === 0) next.platforms = t.errors.required;
    if (categories.length === 0) next.categories = t.errors.required;
    if (creatorsNeeded.trim()) {
      const cn = Number(creatorsNeeded);
      if (!Number.isInteger(cn) || cn <= 0) next.creatorsNeeded = t.errors.priceInt;
    }
    if (deadline.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(deadline.trim())) next.deadline = t.errors.invalidDate;
    if (Object.keys(next).length) {
      setErrors(next);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError(null);
    try {
      const res = await create.mutateAsync({
        title,
        description,
        budgetMin: bMin,
        budgetMax: bMax,
        platforms,
        categories,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        creatorsNeeded: creatorsNeeded ? Number(creatorsNeeded) : undefined,
      });
      toast(t.checkout.success, "success");
      router.replace(`/campaigns/${res.id}`);
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(err, t));
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.campaigns.newTitle} />}>
      <TextField label={t.campaigns.titleLabel} value={title} onChangeText={setTitle} error={errors.title} />
      <TextField label={t.campaigns.descriptionLabel} value={description} onChangeText={setDescription} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: "top" }} error={errors.description} />
      <View style={styles.row}>
        <TextField label={`${t.campaigns.budget} min`} value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" error={errors.budgetMin} />
        <TextField label={`${t.campaigns.budget} max`} value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" error={errors.budgetMax} />
      </View>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.campaigns.platforms}</Text>
        <View style={styles.chipsWrap}>
          {PLATFORMS.map((p) => (
            <Chip key={p} label={p} active={platforms.includes(p)} onPress={() => setPlatforms((v) => toggle(v, p))} />
          ))}
        </View>
        {errors.platforms ? <Text style={[styles.fieldError, { color: palette.danger }]}>{errors.platforms}</Text> : null}
      </Card>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.campaigns.categories}</Text>
        <View style={styles.chipsWrap}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={categories.includes(c)} onPress={() => setCategories((v) => toggle(v, c))} />
          ))}
        </View>
        {errors.categories ? <Text style={[styles.fieldError, { color: palette.danger }]}>{errors.categories}</Text> : null}
      </Card>
      <TextField label={t.campaigns.creatorsNeeded} value={creatorsNeeded} onChangeText={setCreatorsNeeded} keyboardType="numeric" error={errors.creatorsNeeded} />
      <TextField label={t.campaigns.deadline} value={deadline} onChangeText={setDeadline} placeholder={t.checkout.deadlinePlaceholder} autoCapitalize="none" error={errors.deadline} />
      {formError ? <Text style={{ color: palette.danger }}>{formError}</Text> : null}
      <Button title={t.campaigns.createCta} onPress={submit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  fieldError: { fontSize: 12 },
});
