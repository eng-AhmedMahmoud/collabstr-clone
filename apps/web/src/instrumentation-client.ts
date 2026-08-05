// Client-side instrumentation (Next.js `instrumentation-client` file convention).
// Runs after the HTML document loads and before React hydration.
// Absolute no-op when NEXT_PUBLIC_SENTRY_DSN is unset — local dev is unaffected.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    // Modest tracing; bump per-route once baseline volume is known.
    tracesSampleRate: 0.1,
    // Deliberately no replayIntegration — session replay is out of scope.
    debug: false,
  });
}

// Safe to export unconditionally: a no-op when Sentry.init was never called.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
