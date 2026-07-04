import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { useTheme } from "../theme/context";
import { radius, spacing } from "../theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button({ title, onPress, variant = "primary", loading, disabled, style, testID }: Props) {
  const { palette } = useTheme();
  const isDisabled = disabled || loading;
  const base: ViewStyle = {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 46,
  };
  const bg =
    variant === "primary" ? palette.brand :
    variant === "outline" ? "transparent" :
    "transparent";
  const border =
    variant === "outline" ? palette.brand :
    variant === "ghost" ? "transparent" :
    "transparent";
  const fg = variant === "primary" ? "#fff" : palette.brand;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      testID={testID}
      style={({ pressed }) => [
        base,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === "outline" ? 1.5 : 0, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <Text style={[styles.label, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "700" },
});
