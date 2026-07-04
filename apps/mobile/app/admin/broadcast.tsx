import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Chip } from "@/components/Chip";
import { useAdminBroadcast } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { spacing } from "@/theme";
import type { Role } from "@collabstr/shared-types";

const ROLES: (Role | "all")[] = ["all", "brand", "creator", "admin"];

export default function AdminBroadcast() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const send = useAdminBroadcast();

  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [href, setHref] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!titleEn || !titleAr || !bodyEn || !bodyAr) {
      setError(t.common.required);
      return;
    }
    try {
      await send.mutateAsync({
        titleEn, titleAr, bodyEn, bodyAr,
        href: href || undefined,
        role: role === "all" ? undefined : role,
      });
      toast(t.common.done, "success");
      setTitleEn(""); setTitleAr(""); setBodyEn(""); setBodyAr(""); setHref("");
    } catch { setError(t.common.error); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.admin.broadcast} />}>
      <Card>
        <TextField label={t.admin.titleEn} value={titleEn} onChangeText={setTitleEn} />
        <TextField label={t.admin.titleAr} value={titleAr} onChangeText={setTitleAr} />
        <TextField label={t.admin.bodyEn} value={bodyEn} onChangeText={setBodyEn} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
        <TextField label={t.admin.bodyAr} value={bodyAr} onChangeText={setBodyAr} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
        <TextField label={t.admin.href} value={href} onChangeText={setHref} autoCapitalize="none" />
      </Card>
      <Card>
        <Text style={[styles.section, { color: palette.fgMuted }]}>{t.admin.targetRole}</Text>
        <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
          {ROLES.map((r) => (
            <Chip key={r} label={r === "all" ? t.orders.filterAll : r} active={role === r} onPress={() => setRole(r)} />
          ))}
        </View>
      </Card>
      {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
      <Button title={t.admin.sendBroadcast} onPress={submit} loading={send.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, textTransform: "uppercase", fontWeight: "700" },
});
