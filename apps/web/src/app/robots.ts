import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://collabstr-clone.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/creator-dashboard",
        "/settings",
        "/messages",
        "/notifications",
        "/orders",
        "/checkout",
        "/saved",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
