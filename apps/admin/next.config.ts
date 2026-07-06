import type { NextConfig } from "next";

// Fail fast when building/serving for production without an API target — the
// silent localhost fallback would proxy every admin request into the void.
if (process.env.NODE_ENV === "production" && !process.env.API_URL) {
  throw new Error("API_URL must be set in production (admin rewrite target)");
}
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // Avatar uploads live in Vercel Blob (see api uploads.util.ts).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
