import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/context";
import { radius } from "@/theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, active, onPress, style }: Props) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? palette.brand : palette.card,
          borderColor: active ? palette.brand : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: active ? "#fff" : palette.fg, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
