import { Pressable, StyleSheet, Text, View, I18nManager, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/context";
import { spacing } from "@/theme";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  right?: ReactNode;
  hideBack?: boolean;
  style?: ViewStyle;
};

export function AppHeader({ title, right, hideBack, style }: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const canBack = router.canGoBack() && !hideBack;
  const chevron = I18nManager.isRTL ? "chevron-forward" : "chevron-back";

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <View style={styles.side}>
        {canBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, { backgroundColor: pressed ? palette.surface : "transparent" }]}
          >
            <Ionicons name={chevron} size={26} color={palette.fg} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center} pointerEvents="none">
        <Text numberOfLines={1} style={[styles.title, { color: palette.fg }]}>
          {title ?? ""}
        </Text>
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 60, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700" },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
