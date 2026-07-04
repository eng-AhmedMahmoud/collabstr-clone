import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { Avatar } from "@/components/Avatar";
import { ListItem } from "@/components/ListItem";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

export default function Account() {
  const { me, logout } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  if (!me) {
    return (
      <Screen padded>
        <View style={styles.guestWrap}>
          <BrandMark size={80} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.profile.guestTitle}</Text>
          <Text style={[styles.sub, { color: palette.fgMuted }]}>{t.profile.guestSubtitle}</Text>
          <View style={{ height: spacing.md }} />
          <Button title={t.profile.goLogin} onPress={() => router.push("/(auth)/login")} />
          <Button title={t.profile.goSignup} variant="outline" onPress={() => router.push("/(auth)/signup")} />
        </View>
      </Screen>
    );
  }

  const dashboardHref =
    me.role === "brand" ? "/dashboard/brand" :
    me.role === "creator" ? "/dashboard/creator" :
    null;

  return (
    <Screen scroll padded>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Avatar uri={me.avatarUrl} seed={me.email} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: palette.fg }]}>{me.name}</Text>
          <Text style={[styles.email, { color: palette.fgMuted }]}>{me.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.roleText, { color: palette.brand }]}>{me.role.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.profile.account}</Text>
      {dashboardHref ? (
        <ListItem label={t.settings.dashboard} icon="stats-chart-outline" onPress={() => router.push(dashboardHref as any)} />
      ) : null}
      {me.role === "creator" ? (
        <ListItem label={t.settings.packages} icon="cube-outline" onPress={() => router.push("/dashboard/packages")} />
      ) : null}
      <ListItem label={t.saved.title} icon="bookmark-outline" onPress={() => router.push("/saved")} />
      {me.creatorUsername ? (
        <ListItem
          label={t.tabs.discover}
          value={`@${me.creatorUsername}`}
          icon="person-outline"
          onPress={() => router.push(`/creator/${me.creatorUsername}`)}
        />
      ) : null}

      <Text style={[styles.section, { color: palette.fgMuted }]}>{t.settings.title}</Text>
      <ListItem label={t.settings.account} icon="person-outline" onPress={() => router.push("/settings/account")} />
      <ListItem label={t.settings.security} icon="lock-closed-outline" onPress={() => router.push("/settings/security")} />
      <ListItem label={t.settings.notifications} icon="notifications-outline" onPress={() => router.push("/settings/notifications")} />
      <ListItem label={t.settings.appearance} icon="color-palette-outline" onPress={() => router.push("/settings/appearance")} />
      <ListItem label={t.settings.language} icon="language-outline" onPress={() => router.push("/settings/language")} />
      <ListItem label={t.settings.billing} icon="card-outline" onPress={() => router.push("/settings/billing")} />
      <ListItem label={t.settings.help} icon="help-circle-outline" onPress={() => router.push("/static/help")} />
      <ListItem label={t.settings.privacy} icon="shield-checkmark-outline" onPress={() => router.push("/static/privacy")} />
      <ListItem label={t.settings.terms} icon="document-text-outline" onPress={() => router.push("/static/terms")} />

      {me.role === "admin" ? (
        <>
          <Text style={[styles.section, { color: palette.fgMuted }]}>{t.settings.admin}</Text>
          <ListItem label={t.admin.title} icon="shield-outline" onPress={() => router.push("/admin")} />
        </>
      ) : null}

      <View style={{ height: spacing.md }} />
      <Button title={t.settings.logout} variant="outline" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  guestWrap: { alignItems: "center", gap: spacing.sm, marginTop: spacing.xxl },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: spacing.md },
  sub: { fontSize: 14, textAlign: "center", maxWidth: 320 },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 13, marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleText: { fontSize: 10, fontWeight: "800" },
  section: { fontSize: 12, fontWeight: "700", marginTop: spacing.md, textTransform: "uppercase" },
});
