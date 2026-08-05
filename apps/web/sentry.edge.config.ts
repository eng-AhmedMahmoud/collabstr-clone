// Sentry Edge runtime config — imported from src/instrumentation.ts when
// NEXT_RUNTIME === "edge". No-op when no DSN is set (local dev).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    debug: false,
  });
}
