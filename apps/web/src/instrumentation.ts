// Server-side instrumentation (Next.js `instrumentation` file convention).
// `register()` runs once per server instance; `onRequestError` reports server
// errors (RSC render, route handlers, server actions, proxy) to Sentry.
// Both are absolute no-ops when no DSN is configured.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// No-op when Sentry.init was never called (no DSN).
export const onRequestError = Sentry.captureRequestError;
