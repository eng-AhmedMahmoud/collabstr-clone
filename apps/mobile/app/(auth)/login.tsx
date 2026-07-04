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
import { ApiError } from "@/api/client";

export default function Login() {
  const { login, loading } = useAuth();
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/account");
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 401 ? t.auth.invalid : e.message) : t.common.error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded>
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
          testID="login-password"
        />
        {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
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
