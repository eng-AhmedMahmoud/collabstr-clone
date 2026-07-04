import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function ForCreators() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Screen scroll padded header={<AppHeader title="For Creators" />}>
      <View style={{ alignItems: "center", gap: spacing.sm }}>
        <BrandMark size={80} />
        <Text style={{ color: palette.fg, fontSize: 22, fontWeight: "800", textAlign: "center" }}>Get paid to create</Text>
        <Text style={{ color: palette.fgMuted, textAlign: "center" }}>Discover brand campaigns, list your packages, and earn in SAR — safely escrowed.</Text>
      </View>
      <Card>
        <Text style={{ color: palette.fg }}>• List packages with your pricing</Text>
        <Text style={{ color: palette.fg }}>• Get Mawthooq verified for the KSA badge</Text>
        <Text style={{ color: palette.fg }}>• Apply to campaigns from brands</Text>
        <Text style={{ color: palette.fg }}>• Message brands directly</Text>
      </Card>
      <Button title={t.auth.signupCta} onPress={() => router.push("/(auth)/signup")} />
    </Screen>
  );
}
