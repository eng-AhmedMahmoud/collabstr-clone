import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/context";
import { spacing } from "@/theme";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: ReactNode;
};

export function EmptyState({ title, subtitle, icon = "leaf-outline", action }: Props) {
  const { palette } = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={44} color={palette.fgMuted} />
      <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: palette.fgMuted }]}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xxl },
  title: { fontSize: 17, fontWeight: "700", marginTop: spacing.sm },
  sub: { fontSize: 13, textAlign: "center", maxWidth: 320 },
});
