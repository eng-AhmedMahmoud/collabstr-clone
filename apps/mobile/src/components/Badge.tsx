import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/context";

type Tone = "brand" | "success" | "danger" | "neutral" | "accent";

type Props = {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
};

export function Badge({ label, tone = "brand", style }: Props) {
  const { palette } = useTheme();
  const bg =
    tone === "brand" ? palette.brand :
    tone === "success" ? palette.success :
    tone === "danger" ? palette.danger :
    tone === "accent" ? palette.accent :
    palette.surface;
  const fg = tone === "neutral" ? palette.fg : "#fff";
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700" },
});
