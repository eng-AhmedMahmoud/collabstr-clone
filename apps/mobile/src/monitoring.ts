import * as Sentry from "@sentry/react-native";

// EXPO_PUBLIC_* vars are inlined into the JS bundle at build time by
// babel-preset-expo, so this is a static, crash-free check.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** True when a DSN is configured and Sentry.init() actually ran. */
export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  // Expo Go safe: the SDK resolves the RNSentry native module with the
  // non-throwing TurboModuleRegistry.get()/NativeModules lookup
  // (@sentry/react-native dist/js/wrapper.js getRNSentryModule). When the
  // module is absent — as in Expo Go — init() flips enableNative=false via
  // NATIVE.isNativeAvailable() and runs JS-only: errors ship over the fetch
  // transport, native crash handling/offline caching stay off, and the
  // "native SDK missing" nagger is auto-disabled in Expo Go (options.js
  // shouldEnableNativeNagger).
  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
  });
}
