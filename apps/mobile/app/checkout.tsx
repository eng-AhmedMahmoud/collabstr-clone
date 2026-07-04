import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useCreatorByUsername } from "@/api/queries";
import { useCreateOrder } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { spacing } from "@/theme";

export default function Checkout() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams<{ creator?: string; package?: string }>();
  const creator = useCreatorByUsername(params.creator ?? "", { enabled: !!params.creator });
  const create = useCreateOrder();
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pkg = useMemo(
    () => creator.data?.packages.find((p) => p.id === params.package) ?? null,
    [creator.data, params.package],
  );

  const submit = async () => {
    setError(null);
    if (!pkg) return;
    if (brief.trim().length < 10) {
      setError(t.common.required);
      return;
    }
    try {
      const res = await create.mutateAsync({
        packageId: pkg.id,
        brief: brief.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      toast(t.checkout.success, "success");
      router.replace(`/orders/${res.id}`);
    } catch {
      setError(t.common.error);
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.checkout.title} />}>
      {creator.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : !pkg || !creator.data ? (
        <Text style={{ color: palette.danger }}>{t.common.error}</Text>
      ) : (
        <>
          <Card>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.creator}</Text>
            <Text style={[styles.strong, { color: palette.fg }]}>{creator.data.user.name}</Text>
            <Text style={[styles.section, { color: palette.fgMuted }]}>{t.orders.package}</Text>
            <View style={styles.rowBetween}>
              <Text style={[styles.strong, { color: palette.fg }]}>{pkg.title}</Text>
              <Text style={[styles.strong, { color: palette.brand }]}>{pkg.price} {t.discover.sar}</Text>
            </View>
            {pkg.description ? <Text style={{ color: palette.fgMuted }}>{pkg.description}</Text> : null}
          </Card>

          <TextField
            label={t.checkout.brief}
            value={brief}
            onChangeText={setBrief}
            placeholder={t.checkout.briefPlaceholder}
            multiline
            numberOfLines={5}
            style={{ minHeight: 120, textAlignVertical: "top" }}
          />
          <TextField
            label={t.checkout.deadline}
            value={deadline}
            onChangeText={setDeadline}
            placeholder={t.checkout.deadlinePlaceholder}
            autoCapitalize="none"
          />
          {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
          <Button title={t.checkout.submit} onPress={submit} loading={create.isPending} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  strong: { fontSize: 15, fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
