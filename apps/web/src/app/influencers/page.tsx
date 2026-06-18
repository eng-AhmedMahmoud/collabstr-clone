import { CreatorCard } from "@/components/creator-card";
import { FilterBar } from "@/components/filter-bar";
import { serverApi } from "@/lib/api";
import type { ApiCreator } from "@/lib/types";

type Resp = { total: number; page: number; pageSize: number; items: ApiCreator[] };

export const metadata = { title: "Find creators — Nakhla" };
export const dynamic = "force-dynamic";

export default async function InfluencersPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.platform) params.set("platform", sp.platform);
  if (sp.category) params.set("category", sp.category);
  if (sp.q) params.set("q", sp.q);
  if (sp.page) params.set("page", sp.page);
  params.set("pageSize", "24");

  const api = await serverApi();
  let data: Resp = { total: 0, page: 1, pageSize: 24, items: [] };
  try { data = await api.get<Resp>(`/creators?${params.toString()}`); } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-black">Find creators</h1>
      <p className="text-muted mt-1">
        {data.total > 0 ? `${data.total.toLocaleString()} vetted creators` : "No creators found — try adjusting your filters."}
      </p>

      <div className="mt-6 sticky top-16 z-30 bg-bg/95 backdrop-blur py-3 -mx-2 px-2">
        <FilterBar />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((c) => <CreatorCard key={c.username} c={c} />)}
      </div>

      {data.items.length === 0 && (
        <p className="text-center text-muted mt-12">No matches. Start API + seed DB, or try different filters.</p>
      )}
    </div>
  );
}
