import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://collabstr-clone.vercel.app";
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ListResp = { items?: { username: string }[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/influencers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/campaigns`, changeFrequency: "daily", priority: 0.8 },
  ];

  // Creator profiles — best effort; the sitemap must still build if the API is down.
  let creators: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/v1/creators?pageSize=100`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as ListResp;
      creators = (data.items ?? []).map((c) => ({
        url: `${SITE_URL}/${encodeURIComponent(c.username)}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    creators = [];
  }

  return [...staticEntries, ...creators];
}
