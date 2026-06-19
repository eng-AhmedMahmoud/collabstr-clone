import { notFound } from "next/navigation";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import { fmtMoney } from "@/lib/format";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";

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
  const i = await t();
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
      <Link href="/campaigns" className="text-sm text-muted">← {i.campaigns.detail.back}</Link>
      <header className="mt-4">
        <div className="text-xs text-muted">{c.brand.name} · {days}d {i.campaigns.postedSuffix} · {c.applications.length} {i.campaigns.applicants}</div>
        <h1 className="text-3xl font-black mt-1">{c.title}</h1>
        <p className="mt-2 font-bold">{fmtMoney(c.budgetMin)} – {fmtMoney(c.budgetMax)}</p>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {c.platforms.map((p) => <span key={p} className="text-[11px] uppercase font-semibold px-2 py-1 rounded-full bg-surface">{p}</span>)}
          {c.categories.map((cat) => <span key={cat} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-brand-50 text-brand">{cat}</span>)}
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6 whitespace-pre-wrap">
        <h2 className="font-bold text-lg mb-3">{i.campaigns.detail.brief}</h2>
        <p className="text-fg/80 leading-relaxed">{c.description}</p>
      </section>

      {!isOwner && me?.role === "creator" && (
        <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
          <h2 className="font-bold text-lg">{i.campaigns.detail.apply}</h2>
          <form action={`/campaigns/${c.id}/apply`} method="post" className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold">{i.campaigns.detail.yourPrice}</span>
              <input type="number" name="price" min={50} placeholder="500" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">{i.campaigns.detail.pitch}</span>
              <textarea name="pitch" rows={4} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" placeholder={i.campaigns.detail.pitchPlaceholder} />
            </label>
            <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.campaigns.detail.submitApp}</button>
          </form>
        </section>
      )}

      {isOwner && (
        <section className="mt-6 rounded-2xl border border-border bg-elevated">
          <header className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-lg">{i.campaigns.detail.applicants} ({c.applications.length})</h2>
            <span className="text-xs text-muted">{i.campaigns.detail.clickHint}</span>
          </header>
          <ul className="divide-y divide-border">
            {c.applications.map((a) => (
              <li key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <Link href={`/${a.creator.username}`} className="font-semibold hover:text-brand">{a.creator.user.name}</Link>
                  <p className="text-xs text-muted">{a.creator.headline}</p>
                  <p className="mt-2 text-sm text-fg/80 line-clamp-3">{a.pitch}</p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="font-bold">{fmtMoney(a.price)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.status === "accepted" ? "bg-emerald-50 text-emerald-700" : a.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{i.status[a.status as keyof typeof i.status] ?? a.status}</span>
                </div>
              </li>
            ))}
            {c.applications.length === 0 && <li className="p-8 text-center text-muted text-sm">{i.campaigns.detail.noApps}</li>}
          </ul>
        </section>
      )}

      {!me && (
        <p className="mt-6 text-sm text-muted text-center">
          <Link href={`/login?next=/campaigns/${c.id}`} className="font-semibold underline">{i.nav.login}</Link> {i.campaigns.detail.loginToApply}
        </p>
      )}
    </div>
  );
}
