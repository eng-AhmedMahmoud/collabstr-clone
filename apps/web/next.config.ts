import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

if (process.env.NODE_ENV === "production" && !process.env.API_URL) {
  throw new Error("API_URL must be set in production — the /api/v1 rewrite would otherwise proxy to localhost.");
}
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Avatar uploads live in Vercel Blob (see api uploads.util.ts).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

// Only compose the Sentry wrapper when a DSN is configured so local dev
// (no DSN) builds exactly as before. Source-map upload additionally requires
// SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT; without them the wrapper
// skips upload and only injects runtime config.
const sentryEnabled = Boolean(
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      // Upload a wider set of source maps for readable stack traces.
      widenClientFileUpload: true,
      // Tree-shake Sentry logger statements from production bundles.
      disableLogger: true,
    })
  : nextConfig;
