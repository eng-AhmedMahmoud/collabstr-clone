import * as Sentry from "@sentry/nestjs";

// Imported as the very first line of main.ts so Sentry can instrument
// everything that loads after it. No-op without SENTRY_DSN — local dev and
// CI run entirely unaffected.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
  });
}
