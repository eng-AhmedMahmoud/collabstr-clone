import type { NextConfig } from "next";

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

export default nextConfig;
