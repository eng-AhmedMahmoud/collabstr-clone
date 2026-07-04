import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { AvatarPicker } from "@/components/AvatarPicker";
import { useAuth } from "@/auth/context";
import { useUpdateMe, useDeleteAccount } from "@/api/mutations";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/useConfirm";
import { api, API_BASE, API_PREFIX } from "@/api/client";
import { spacing } from "@/theme";

export default function AccountSettings() {
  const { me, refresh, logout } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const update = useUpdateMe();
  const del = useDeleteAccount();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (me) {
      setName(me.name);
      setAvatarUrl(me.avatarUrl ?? "");
    }
  }, [me]);

  const save = async () => {
    try {
      await update.mutateAsync({ name, avatarUrl: avatarUrl || undefined });
      await refresh();
      toast(t.common.done, "success");
    } catch { toast(t.common.error, "error"); }
  };

  const doExport = async () => {
    try {
      const data = await api("/users/me/export");
      toast(`${t.settings.exportData}: ${API_BASE}${API_PREFIX}/users/me/export`, "info");
      console.log("[export]", data);
    } catch { toast(t.common.error, "error"); }
  };

  const doDelete = async () => {
    const ok = await confirm({
      title: t.settings.deleteAccount,
      message: t.settings.deleteAccountWarn,
      okText: t.settings.deleteAccount,
      destructive: true,
    });
    if (!ok) return;
    try {
      await del.mutateAsync();
      await logout();
      router.replace("/(auth)/login");
    } catch { toast(t.common.error, "error"); }
  };

  if (!me) return <Screen padded header={<AppHeader title={t.settings.account} />}><Text style={{ color: palette.fg }}>{t.profile.guestTitle}</Text></Screen>;

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.editProfile} />}>
      <Card>
        <View style={{ alignItems: "center" }}>
          <AvatarPicker
            uri={avatarUrl || null}
            seed={me.email}
            onUploaded={async (url) => {
              setAvatarUrl(url);
              await refresh();
            }}
          />
        </View>
        <TextField label={t.settings.displayName} value={name} onChangeText={setName} />
        <TextField label={t.settings.avatarUrl} value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" />
        <Button title={t.settings.saveChanges} onPress={save} loading={update.isPending} />
      </Card>

      <Card>
        <Button title={t.settings.exportData} variant="outline" onPress={doExport} />
        <View style={{ height: spacing.sm }} />
        <Button title={t.settings.deleteAccount} variant="outline" onPress={doDelete} loading={del.isPending} />
      </Card>
    </Screen>
  );
}
