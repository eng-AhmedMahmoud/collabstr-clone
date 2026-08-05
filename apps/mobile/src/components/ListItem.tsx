import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
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
  const { isRTL } = useI18n();
  const align = isRTL ? "right" : "left";
  // The row itself is mirrored by the root `direction` wrapper; the trailing
  // chevron just needs the glyph that points "forward" for the active script.
  const chevron = isRTL ? "chevron-back" : "chevron-forward";
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
        <Text style={[styles.label, { color: danger ? palette.danger : palette.fg, textAlign: align }]}>{label}</Text>
        {value ? <Text style={[styles.value, { color: palette.fgMuted, textAlign: align }]}>{value}</Text> : null}
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
