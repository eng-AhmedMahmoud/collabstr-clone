// Client instrumentation (Next.js convention: src/instrumentation-client.ts).
// Runs after the HTML document loads, before hydration — ideal for error tracking.
// No-op when no DSN is configured (local dev).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

// Navigation breadcrumbs/spans — safe no-op when Sentry.init was skipped.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
