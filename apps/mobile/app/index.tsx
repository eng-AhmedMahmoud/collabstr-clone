import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/auth/context";
import { useTheme } from "@/theme/context";

// Root gate: while hydrating from SecureStore we show a spinner, then
// route to tabs (everyone — auth is optional to browse) but auth screens
// are behind their own route group and reached from the profile tab.
export default function Index() {
  const { hydrated } = useAuth();
  const { palette } = useTheme();
  if (!hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: palette.bg }]}>
        <ActivityIndicator color={palette.brand} />
      </View>
    );
  }
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
