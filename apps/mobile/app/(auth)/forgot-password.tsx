import { StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

// Honest state: no password-reset API exists yet, so we say so instead of
// faking a "check your inbox" flow that never sends anything.
export default function ForgotPassword() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.forgotTitle}</Text>
          <Text style={[styles.sub, { color: palette.fgMuted }]}>{t.auth.resetUnavailable}</Text>
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
