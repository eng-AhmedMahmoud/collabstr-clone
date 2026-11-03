// Import first so Sentry.init() (gated on EXPO_PUBLIC_SENTRY_DSN) runs
// before the rest of the app modules are evaluated.
import { sentryEnabled } from "@/monitoring";
import * as Sentry from "@sentry/react-native";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/context";
import { ThemeProvider, useTheme } from "@/theme/context";
import { I18nProvider, useI18n } from "@/i18n/context";
import { ToastProvider } from "@/components/Toast";
import { queryClient } from "@/api/queryClient";

// Consumes the i18n context so the whole tree re-lays-out when the locale
// changes. Setting `direction` on this container makes Yoga mirror flex
// start/end for the subtree — RTL applies live, no native reload needed.
function DirectionRoot() {
  const { dir } = useI18n();
  const { scheme } = useTheme();
  return (
    <View style={{ flex: 1, direction: dir }}>
      {/* Follow the in-app theme, not the OS ("auto" would track the device). */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider>
                  <DirectionRoot />
                </ToastProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap() is safe even without init() — ReactNativeProfiler bails out
// when no client exists — but conditionally wrapping keeps the tree entirely
// Sentry-free (no TouchEventBoundary/Profiler) when no DSN is configured,
// e.g. day-to-day Expo Go dev.
export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
