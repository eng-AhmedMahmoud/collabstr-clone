import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { radius, spacing } from "@/theme";

// Shown at root level whenever the native layout direction doesn't match the
// active locale (e.g. first launch on an Arabic device renders LTR). A restart
// applies the direction; in Expo Go reloadAsync throws ERR_UPDATES_DISABLED,
// so we surface manual instructions instead of failing silently.
export function RtlRestartBanner() {
  const { t, needsRestart } = useI18n();
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!needsRestart || dismissed) return null;

  const restart = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      setFailed(true);
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        { top: insets.top + spacing.sm, backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, { color: palette.fg }]}>
        {failed ? t.settings.restartFailed : t.settings.rtlBanner}
      </Text>
      <View style={styles.actions}>
        {!failed ? (
          <Pressable onPress={restart} hitSlop={6}>
            <Text style={{ color: palette.brand, fontWeight: "700", fontSize: 13 }}>
              {t.settings.restartNow}
            </Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => setDismissed(true)} hitSlop={6} accessibilityRole="button">
          <Ionicons name="close" size={18} color={palette.fgMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: { flex: 1, fontSize: 13 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
});
