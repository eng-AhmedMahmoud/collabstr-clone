import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useCreatorMe } from "@/api/queries";
import { useAddPackage, useDeletePackage } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/useConfirm";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@/theme";

export default function PackagesScreen() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();
  const q = useCreatorMe();
  const add = useAddPackage();
  const del = useDeletePackage();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    const p = Number(price);
    if (!title || !p) return;
    try {
      await add.mutateAsync({ title, price: p, description: desc || undefined });
      setTitle(""); setPrice(""); setDesc("");
      toast(t.common.done, "success");
    } catch { toast(t.common.error, "error"); }
  };

  const onDelete = async (id: string) => {
    const ok = await confirm({ title: t.dashboard.delete, message: t.settings.deleteAccountWarn, destructive: true });
    if (!ok) return;
    try { await del.mutateAsync(id); } catch { toast(t.common.error, "error"); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.dashboard.packagesTitle} />}>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.addPackage}</Text>
        <TextField label={t.dashboard.packageTitle} value={title} onChangeText={setTitle} />
        <TextField label={t.dashboard.packagePrice} value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TextField label={t.dashboard.packageDesc} value={desc} onChangeText={setDesc} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
        <Button title={t.dashboard.addPackage} onPress={submit} loading={add.isPending} disabled={!title || !price} />
      </Card>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.dashboard.packagesTitle}</Text>
      {q.isLoading ? (
        <ActivityIndicator color={palette.brand} />
      ) : (q.data?.packages?.length ?? 0) === 0 ? (
        <EmptyState title={t.creator.noPackages} icon="cube-outline" />
      ) : (
        q.data!.packages.map((p) => (
          <Card key={p.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.fg, fontWeight: "700" }}>{p.title}</Text>
                {p.description ? <Text style={{ color: palette.fgMuted, fontSize: 12 }}>{p.description}</Text> : null}
              </View>
              <Text style={{ color: palette.brand, fontWeight: "800" }}>{p.price} {t.discover.sar}</Text>
              <Pressable onPress={() => onDelete(p.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={palette.danger} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
});
