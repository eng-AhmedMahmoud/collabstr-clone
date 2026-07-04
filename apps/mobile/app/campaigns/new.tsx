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
  const [error, setError] = useState<string | null>(null);

  const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = async () => {
    setError(null);
    if (title.length < 4 || description.length < 20 || !budgetMin || !budgetMax || platforms.length === 0 || categories.length === 0) {
      setError(t.common.required);
      return;
    }
    try {
      const res = await create.mutateAsync({
        title,
        description,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        platforms,
        categories,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        creatorsNeeded: creatorsNeeded ? Number(creatorsNeeded) : undefined,
      });
      toast(t.checkout.success, "success");
      router.replace(`/campaigns/${res.id}`);
    } catch { setError(t.common.error); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.campaigns.newTitle} />}>
      <TextField label={t.campaigns.detailTitle} value={title} onChangeText={setTitle} />
      <TextField label={t.campaigns.detailTitle} value={description} onChangeText={setDescription} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: "top" }} />
      <View style={styles.row}>
        <TextField label={`${t.campaigns.budget} min`} value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" />
        <TextField label={`${t.campaigns.budget} max`} value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" />
      </View>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.campaigns.platforms}</Text>
        <View style={styles.chipsWrap}>
          {PLATFORMS.map((p) => (
            <Chip key={p} label={p} active={platforms.includes(p)} onPress={() => setPlatforms((v) => toggle(v, p))} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.campaigns.categories}</Text>
        <View style={styles.chipsWrap}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={categories.includes(c)} onPress={() => setCategories((v) => toggle(v, c))} />
          ))}
        </View>
      </Card>
      <TextField label={t.campaigns.creatorsNeeded} value={creatorsNeeded} onChangeText={setCreatorsNeeded} keyboardType="numeric" />
      <TextField label={t.campaigns.deadline} value={deadline} onChangeText={setDeadline} placeholder={t.checkout.deadlinePlaceholder} autoCapitalize="none" />
      {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
      <Button title={t.campaigns.createCta} onPress={submit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
});
