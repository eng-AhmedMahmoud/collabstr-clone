import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { useI18n } from "@/i18n/context";
import { useTheme } from "@/theme/context";
import { RiyalSymbol } from "./RiyalSymbol";

type Props = {
  value: number | null | undefined;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
};

// Renders the official Saudi Riyal symbol (SVG) inline before the localized
// number. RN can't inline an SVG into a Text run, so this is a tiny row.
// The symbol colour/size default to whatever the surrounding text style uses,
// so call sites can pass the same style they had on the old price Text.
export function Money({ value, color, size, style }: Props) {
  const { locale } = useI18n();
  const { palette } = useTheme();

  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const resolvedColor = color ?? (typeof flat.color === "string" ? flat.color : palette.fg);
  const fontSize = size ?? (typeof flat.fontSize === "number" ? flat.fontSize : 14);

  if (value == null) {
    return <Text style={[{ color: palette.fgMuted, fontSize }, style]}>—</Text>;
  }

  const n = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
  return (
    <View style={styles.row}>
      <RiyalSymbol color={resolvedColor} size={fontSize} />
      <Text style={[{ color: resolvedColor, fontSize }, style]}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
});
