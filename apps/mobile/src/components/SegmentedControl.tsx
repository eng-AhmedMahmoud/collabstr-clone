import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/context";
import { radius } from "@/theme";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { palette } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.seg,
              active && { backgroundColor: palette.card, shadowColor: "#000" },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: active ? palette.fg : palette.fgMuted, fontWeight: active ? "700" : "500", fontSize: 13 }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 3,
  },
  seg: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.sm,
  },
});
