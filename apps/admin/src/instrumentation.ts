// Server instrumentation (Next.js convention: src/instrumentation.ts).
// `register` runs once per server instance; runtime-specific Sentry config is
// imported lazily per the Next.js instrumentation guide.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Reports server request errors (render/route/action) to Sentry.
// Safe no-op when Sentry.init was skipped (no DSN configured).
export const onRequestError = Sentry.captureRequestError;
