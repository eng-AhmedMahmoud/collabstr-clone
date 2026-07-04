import { Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

export default function About() {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.help} />}>
      <View style={{ alignItems: "center", gap: spacing.sm }}>
        <BrandMark size={80} />
        <Text style={{ color: palette.fg, fontSize: 22, fontWeight: "800" }}>{t.brand.name}</Text>
        <Text style={{ color: palette.fgMuted, textAlign: "center" }}>{t.brand.tagline}</Text>
      </View>
      <Card>
        <Text style={{ color: palette.fg }}>Built for the KSA creator economy. Escrow-backed bookings, Mawthooq verification, campaign marketplace.</Text>
      </Card>
    </Screen>
  );
}
