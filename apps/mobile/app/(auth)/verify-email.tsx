import { StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function VerifyEmail() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.verifyTitle}</Text>
          <Text style={[styles.sub, { color: palette.fgMuted }]}>{t.auth.verifySub}</Text>
          {params.token ? (
            <Text style={[styles.sub, { color: palette.fgMuted }]}>Token: {String(params.token).slice(0, 12)}…</Text>
          ) : null}
        </View>
        <Button title={t.auth.loginCta} onPress={() => router.replace("/(auth)/login")} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, textAlign: "center", maxWidth: 320 },
});
