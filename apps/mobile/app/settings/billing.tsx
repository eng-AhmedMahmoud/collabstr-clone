import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";

export default function BillingSettings() {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.billing} />}>
      <Card>
        <Text style={{ color: palette.fg }}>{t.settings.billingSoon}</Text>
      </Card>
    </Screen>
  );
}
