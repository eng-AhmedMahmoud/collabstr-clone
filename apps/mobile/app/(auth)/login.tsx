import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";

export default function Login() {
  const { login, loading } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const nextErrors: Record<string, string> = {};
    const em = email.trim();
    if (!em) nextErrors.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) nextErrors.email = t.errors.emailInvalid;
    if (!password) nextErrors.password = t.errors.passwordRequired;
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    try {
      await login(em, password);
      router.replace("/(tabs)/account");
    } catch (e) {
      const fe = fieldErrorsFrom(e);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(e, t, { on401: t.errors.invalidCredentials }));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded edges={["left", "right"]}>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.loginTitle}</Text>
        </View>
        <TextField
          label={t.auth.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
          testID="login-email"
        />
        <TextField
          label={t.auth.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          error={errors.password}
          testID="login-password"
        />
        {formError ? <Text style={{ color: palette.danger }}>{formError}</Text> : null}
        <Button title={t.auth.loginCta} onPress={submit} loading={loading} testID="login-submit" />
        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={[styles.switch, { color: palette.brand }]}>{t.auth.forgot}</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/(auth)/signup")}>
          <Text style={[styles.switch, { color: palette.brand }]}>{t.auth.switchToSignup}</Text>
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: "800" },
  switch: { textAlign: "center", fontWeight: "700", marginTop: spacing.md },
});
