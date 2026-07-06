import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/context";
import { radius, spacing } from "@/theme";
import { RiyalSymbol } from "./RiyalSymbol";

type Props = { label: string; value: string; hint?: string; money?: boolean };

export function StatCard({ label, value, hint, money }: Props) {
  const { palette } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.fgMuted }]}>{label}</Text>
      {money ? (
        <View style={styles.valueRow}>
          <RiyalSymbol color={palette.fg} size={20} />
          <Text style={[styles.value, { color: palette.fg }]}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.value, { color: palette.fg }]}>{value}</Text>
      )}
      {hint ? <Text style={[styles.hint, { color: palette.brand }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 2,
  },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  value: { fontSize: 20, fontWeight: "800" },
  hint: { fontSize: 11, fontWeight: "600" },
});
