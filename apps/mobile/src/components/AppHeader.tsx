import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { spacing } from "@/theme";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  right?: ReactNode;
  hideBack?: boolean;
  style?: ViewStyle;
  /** Set true when AppHeader is the Stack navigator's `header` prop.
   *  It renders outside any SafeAreaView so needs to consume the top inset itself.
   *  Leave false (default) when passed via Screen's `header` prop — Screen's
   *  SafeAreaView already handles the top inset. */
  stackHeader?: boolean;
};

export function AppHeader({ title, right, hideBack, style, stackHeader = false }: Props) {
  const { palette } = useTheme();
  const { isRTL } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const canBack = router.canDismiss() && !hideBack;
  // In Arabic the header row is mirrored by the root `direction` wrapper, so the
  // back control sits on the right; the glyph must point the RTL "back" way too.
  const chevron = isRTL ? "chevron-forward" : "chevron-back";

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg, borderColor: palette.border, paddingTop: stackHeader ? insets.top : 0 }, style]}>
      <View style={styles.side}>
        {canBack ? (
          <Pressable
            onPress={() => router.dismiss()}
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
    minHeight: 52,
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
