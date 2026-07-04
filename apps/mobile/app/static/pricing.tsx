import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";

export default function Pricing() {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <Screen scroll padded header={<AppHeader title="Pricing" />}>
      <Card>
        <Text style={{ color: palette.fg, fontWeight: "800", fontSize: 18 }}>Free to browse</Text>
        <Text style={{ color: palette.fgMuted }}>Sign up as a brand or creator at no cost.</Text>
      </Card>
      <Card>
        <Text style={{ color: palette.fg, fontWeight: "800", fontSize: 18 }}>10% platform fee</Text>
        <Text style={{ color: palette.fgMuted }}>Applied on completed orders. Everything else — messaging, campaigns, discovery — is free.</Text>
      </Card>
    </Screen>
  );
}
