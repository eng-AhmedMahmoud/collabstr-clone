import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { ListItem } from "@/components/ListItem";
import { useRouter } from "expo-router";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/auth/context";

export default function SettingsIndex() {
  const { t } = useI18n();
  const { logout, me } = useAuth();
  const router = useRouter();
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.title} />}>
      <ListItem label={t.settings.account} icon="person-outline" onPress={() => router.push("/settings/account")} />
      <ListItem label={t.settings.security} icon="lock-closed-outline" onPress={() => router.push("/settings/security")} />
      <ListItem label={t.settings.notifications} icon="notifications-outline" onPress={() => router.push("/settings/notifications")} />
      <ListItem label={t.settings.appearance} icon="color-palette-outline" onPress={() => router.push("/settings/appearance")} />
      <ListItem label={t.settings.language} icon="language-outline" onPress={() => router.push("/settings/language")} />
      <ListItem label={t.settings.billing} icon="card-outline" onPress={() => router.push("/settings/billing")} />
      {me?.role === "admin" ? (
        <ListItem label={t.settings.admin} icon="shield-outline" onPress={() => router.push("/admin")} />
      ) : null}
      <ListItem label={t.settings.logout} icon="log-out-outline" danger onPress={logout} />
    </Screen>
  );
}
