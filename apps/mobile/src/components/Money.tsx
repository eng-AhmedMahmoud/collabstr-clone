import { Text, type TextProps } from "react-native";
import { useI18n } from "@/i18n/context";
import { useTheme } from "@/theme/context";

type Props = TextProps & { value: number | null | undefined; showCurrency?: boolean };

export function Money({ value, showCurrency = true, style, ...rest }: Props) {
  const { t, locale } = useI18n();
  const { palette } = useTheme();
  if (value == null) return <Text style={[{ color: palette.fgMuted }, style]} {...rest}>—</Text>;
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
  return (
    <Text style={style} {...rest}>
      {n}{showCurrency ? ` ${t.common.sar}` : ""}
    </Text>
  );
}
