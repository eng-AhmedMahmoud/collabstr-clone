import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";

const FAQ_EN = [
  { q: "How do I book a creator?", a: "Open a creator profile, tap a package, fill in the brief, and place the order." },
  { q: "What is Mawthooq?", a: "Mawthooq is the KSA advertising licence (GAMR). Verified creators show a badge on their profile." },
  { q: "How are payments handled?", a: "Funds are held in escrow when you pay, and released after you approve the deliverable." },
  { q: "Can I cancel?", a: "You can cancel before the creator submits the deliverable. Otherwise open a dispute." },
];
const FAQ_AR = [
  { q: "كيف أحجز مبدعًا؟", a: "افتح ملف المبدع، اختر الباقة، اكتب الوصف، ثم أنشئ الطلب." },
  { q: "ما هو موثوق؟", a: "موثوق هي رخصة الإعلان في السعودية (الهيئة العامة للإعلام). المبدعون الموثقون يظهر لديهم شارة." },
  { q: "كيف تتم المدفوعات؟", a: "تبقى الأموال في الضمان حتى تعتمد التسليم، ثم يتم تحريرها للمبدع." },
  { q: "هل يمكنني الإلغاء؟", a: "يمكن الإلغاء قبل تسليم المبدع للعمل. بعد ذلك افتح نزاعًا." },
];

export default function Help() {
  const { palette } = useTheme();
  const { t, locale, isRTL } = useI18n();
  const faqs = locale === "ar" ? FAQ_AR : FAQ_EN;
  const align = isRTL ? "right" : "left";
  return (
    <Screen scroll padded header={<AppHeader title={t.settings.help} />}>
      {faqs.map((f, i) => (
        <Card key={i}>
          <Text style={{ color: palette.fg, fontWeight: "700", textAlign: align }}>{f.q}</Text>
          <Text style={{ color: palette.fgMuted, textAlign: align }}>{f.a}</Text>
        </Card>
      ))}
      <View style={{ height: spacing.md }} />
      <Text style={{ color: palette.fgMuted, fontSize: 12, textAlign: "center" }}>hello@nakhla.dev</Text>
    </Screen>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _styles = StyleSheet.create({});
