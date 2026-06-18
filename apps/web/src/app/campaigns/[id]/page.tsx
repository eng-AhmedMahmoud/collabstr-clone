import { notFound } from "next/navigation";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import { fmtMoney } from "@/lib/format";
import { getSession } from "@/lib/session";

type CampaignDetail = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  platforms: string[];
  categories: string[];
  creatorsNeeded: number;
  status: string;
  createdAt: string;
  brandId: string;
  brand: { name: string; avatarUrl: string | null };
  applications: {
    id: string;
    price: number;
    pitch: string;
    status: string;
    createdAt: string;
    creator: { username: string; headline: string; startingPrice: number; user: { name: string; avatarUrl: string | null } };
  }[];
};

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getSession();
  const api = await serverApi();
  let c: CampaignDetail;
  try { c = await api.get<CampaignDetail>(`/campaigns/${id}`); }
  catch (e: any) { if (e?.status === 404) notFound(); throw e; }

  const isOwner = me?.role === "brand" && me.id === c.brandId;
  const days = Math.max(0, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86_400_000));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/campaigns" className="text-sm text-[#6b7280]">← All campaigns</Link>
      <header className="mt-4">
        <div className="text-xs text-[#6b7280]">{c.brand.name} · Posted {days}d ago · {c.applications.length} applicants</div>
        <h1 className="text-3xl font-black mt-1">{c.title}</h1>
        <p className="mt-2 font-bold">{fmtMoney(c.budgetMin)} – {fmtMoney(c.budgetMax)}</p>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {c.platforms.map((p) => <span key={p} className="text-[11px] uppercase font-semibold px-2 py-1 rounded-full bg-[#f7f7fb]">{p}</span>)}
          {c.categories.map((cat) => <span key={cat} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-[#7c3aed]">{cat}</span>)}
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 whitespace-pre-wrap">
        <h2 className="font-bold text-lg mb-3">Brief</h2>
        <p className="text-[#374151] leading-relaxed">{c.description}</p>
      </section>

      {!isOwner && me?.role === "creator" && (
        <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
          <h2 className="font-bold text-lg">Apply</h2>
          <form action={`/campaigns/${c.id}/apply`} method="post" className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold">Your price ($)</span>
              <input type="number" name="price" min={10} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Pitch</span>
              <textarea name="pitch" rows={4} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" placeholder="Why you're the right fit, what you'd deliver, timeline." />
            </label>
            <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Submit application</button>
          </form>
        </section>
      )}

      {isOwner && (
        <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white">
          <header className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="font-bold text-lg">Applicants ({c.applications.length})</h2>
            <span className="text-xs text-[#6b7280]">Tap an applicant to view profile</span>
          </header>
          <ul className="divide-y divide-[#e5e7eb]">
            {c.applications.map((a) => (
              <li key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <Link href={`/${a.creator.username}`} className="font-semibold hover:text-[#7c3aed]">{a.creator.user.name}</Link>
                  <p className="text-xs text-[#6b7280]">{a.creator.headline}</p>
                  <p className="mt-2 text-sm text-[#374151] line-clamp-3">{a.pitch}</p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="font-bold">{fmtMoney(a.price)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.status === "accepted" ? "bg-emerald-50 text-emerald-700" : a.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{a.status}</span>
                </div>
              </li>
            ))}
            {c.applications.length === 0 && <li className="p-8 text-center text-[#6b7280] text-sm">No applications yet.</li>}
          </ul>
        </section>
      )}

      {!me && (
        <p className="mt-6 text-sm text-[#6b7280] text-center">
          <Link href={`/login?next=/campaigns/${c.id}`} className="font-semibold underline">Log in</Link> to apply.
        </p>
      )}
    </div>
  );
}
