import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";

export default function Terms() {
  const { palette } = useTheme();
  const { t, locale } = useI18n();
  const body = locale === "ar"
    ? "باستخدامك نخلة توافق على شروط الخدمة. المنصة تربط بين العلامات التجارية والمبدعين وفق أنظمة المملكة العربية السعودية. الأموال محجوزة في ضمان حتى يكتمل الطلب."
    : "By using Nakhla you agree to the Terms of Service. The platform connects brands with creators under KSA regulations. Funds are held in escrow until the order is complete.";
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.terms} />}>
      <Card>
        <Text style={{ color: palette.fg, lineHeight: 22 }}>{body}</Text>
      </Card>
    </Screen>
  );
}
