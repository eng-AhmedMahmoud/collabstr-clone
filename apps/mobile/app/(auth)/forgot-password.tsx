import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";
import { spacing } from "@/theme";

export default function ForgotPassword() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    // Backend endpoint is not exposed yet; mirror web's "check inbox" UX.
    setSent(true);
    toast(t.auth.forgotSent, "success");
  };

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.forgotTitle}</Text>
          <Text style={[styles.sub, { color: palette.fgMuted }]}>{t.auth.forgotSub}</Text>
        </View>
        {sent ? (
          <>
            <Text style={{ color: palette.success, fontWeight: "700" }}>{t.auth.forgotSent}</Text>
            <Button title={t.auth.loginCta} onPress={() => router.replace("/(auth)/login")} />
          </>
        ) : (
          <>
            <TextField
              label={t.auth.email}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Button title={t.auth.forgotCta} onPress={submit} />
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, textAlign: "center", maxWidth: 320 },
});
