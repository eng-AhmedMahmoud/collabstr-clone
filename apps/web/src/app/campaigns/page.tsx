import Link from "next/link";
import { serverApi } from "@/lib/api";
import type { ApiCampaign } from "@/lib/types";
import { fmtMoney } from "@/lib/format";

export const metadata = { title: "Open campaigns — Collabstr" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const api = await serverApi();
  let campaigns: ApiCampaign[] = [];
  try { campaigns = await api.get<ApiCampaign[]>("/campaigns"); } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">Open campaigns</h1>
          <p className="text-[#6b7280] mt-1.5">Brands ready to hire. Apply with your pricing and pitch.</p>
        </div>
        <Link href="/campaigns/new" className="inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-semibold whitespace-nowrap">
          Post a campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-center text-[#6b7280] mt-12">No open campaigns. Be the first to post one.</p>
      ) : (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const days = Math.max(0, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86_400_000));
            return (
              <article key={c.id} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between text-xs text-[#6b7280]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-7 w-7 rounded-lg bg-[#0b0b14] text-white grid place-items-center font-black">{c.brand.name[0]}</span>
                    <span className="font-semibold text-[#0b0b14]">{c.brand.name}</span>
                  </span>
                  <span>Posted {days}d ago · {c._count?.applications ?? 0} applicants</span>
                </div>
                <h2 className="text-lg font-bold mt-3">{c.title}</h2>
                <p className="text-sm text-[#6b7280] mt-2 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {c.platforms.map((p) => (
                    <span key={p} className="text-[11px] font-semibold uppercase px-2 py-1 rounded-full bg-[#f7f7fb] text-[#374151]">{p}</span>
                  ))}
                  {c.categories.map((cat) => (
                    <span key={cat} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-[#7c3aed]">{cat}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-5">
                  <p className="font-bold">{fmtMoney(c.budgetMin)} – {fmtMoney(c.budgetMax)}</p>
                  <Link href={`/campaigns/${c.id}`} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0b0b14] text-white">View & apply</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
