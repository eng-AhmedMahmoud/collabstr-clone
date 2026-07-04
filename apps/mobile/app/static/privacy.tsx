import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";

export default function Privacy() {
  const { palette } = useTheme();
  const { t, locale } = useI18n();
  const body = locale === "ar"
    ? "نحن نلتزم بحماية بياناتك وفقًا لنظام حماية البيانات الشخصية في المملكة (PDPL). يمكنك طلب تصدير بياناتك أو حذف حسابك في أي وقت من إعدادات الحساب."
    : "We protect your data under KSA's Personal Data Protection Law (PDPL). You can export your data or delete your account any time from Account Settings.";
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.privacy} />}>
      <Card>
        <Text style={{ color: palette.fg, lineHeight: 22 }}>{body}</Text>
      </Card>
    </Screen>
  );
}
