import { StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

// Honest state: the API has no email-verification endpoint yet, so this
// screen says verification isn't required instead of pretending to verify.
export default function VerifyEmail() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded edges={["left", "right"]}>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.verifyTitle}</Text>
          <Text style={[styles.sub, { color: palette.fgMuted }]}>{t.auth.verifyNotRequired}</Text>
        </View>
        <Button title={t.auth.continueCta} onPress={() => router.replace("/(tabs)")} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, textAlign: "center", maxWidth: 320 },
});
