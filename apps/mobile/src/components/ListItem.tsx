import { Pressable, StyleSheet, Text, View, I18nManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/context";
import { radius, spacing } from "@/theme";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
};

export function ListItem({ label, value, icon, onPress, right, danger }: Props) {
  const { palette } = useTheme();
  const chevron = I18nManager.isRTL ? "chevron-back" : "chevron-forward";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed && onPress ? 0.9 : 1 },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={20} color={danger ? palette.danger : palette.brand} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: danger ? palette.danger : palette.fg }]}>{label}</Text>
        {value ? <Text style={[styles.value, { color: palette.fgMuted }]}>{value}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name={chevron} size={18} color={palette.fgMuted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  label: { fontSize: 15, fontWeight: "600" },
  value: { fontSize: 12, marginTop: 2 },
});
