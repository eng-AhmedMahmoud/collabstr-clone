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
import { spacing, radius } from "@/theme";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";

export default function Signup() {
  const { signup, loading } = useAuth();
  const { palette } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"brand" | "creator">("creator");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = t.errors.nameMin;
    const em = email.trim();
    if (!em) nextErrors.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) nextErrors.email = t.errors.emailInvalid;
    if (!password) nextErrors.password = t.errors.passwordRequired;
    else if (password.length < 8) nextErrors.password = t.errors.passwordMin;
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    try {
      await signup({ name: name.trim(), email: em, password, role, locale });
      router.replace("/(tabs)/account");
    } catch (e) {
      const fe = fieldErrorsFrom(e);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(e, t, { on409: t.errors.emailTaken }));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen scroll padded>
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { color: palette.fg }]}>{t.auth.signupTitle}</Text>
        </View>
        <TextField label={t.auth.name} value={name} onChangeText={setName} error={errors.name} testID="signup-name" />
        <TextField
          label={t.auth.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
          testID="signup-email"
        />
        <TextField
          label={t.auth.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
          testID="signup-password"
        />
        <Text style={[styles.roleLabel, { color: palette.fgMuted }]}>{t.auth.role}</Text>
        <View style={styles.roleRow}>
          <RoleChip
            active={role === "creator"}
            onPress={() => setRole("creator")}
            label={t.auth.creator}
          />
          <RoleChip
            active={role === "brand"}
            onPress={() => setRole("brand")}
            label={t.auth.brand}
          />
        </View>
        {formError ? <Text style={{ color: palette.danger }}>{formError}</Text> : null}
        <Button title={t.auth.signupCta} onPress={submit} loading={loading} testID="signup-submit" />
        <Pressable onPress={() => router.replace("/(auth)/login")}>
          <Text style={[styles.switch, { color: palette.brand }]}>{t.auth.switchToLogin}</Text>
        </Pressable>
      </Screen>
    </>
  );
}

function RoleChip({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? palette.brand : palette.card,
          borderColor: active ? palette.brand : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: active ? "#fff" : palette.fg, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: "800" },
  roleLabel: { fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  roleRow: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: "center",
  },
  switch: { textAlign: "center", fontWeight: "700", marginTop: spacing.md },
});
