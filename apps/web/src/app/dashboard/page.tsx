import Link from "next/link";
import Image from "next/image";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fmtMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { DashboardBrandBar } from "@/components/dashboard-brand-bar";

type OrderRow = {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  deadline?: string | null;
  creator: { user: { name: string; avatarUrl: string | null } };
  package: { title: string };
};

export const metadata = { title: "Dashboard — Nakhla" };
export const dynamic = "force-dynamic";

export default async function BrandDashboard() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/dashboard");
  if (me.role !== "brand") redirect("/creator-dashboard");

  const api = await serverApi();
  let orders: OrderRow[] = [];
  let campaigns: { id: string; title: string; status: string; _count?: { applications: number } }[] = [];
  try { orders = await api.get<OrderRow[]>("/orders"); } catch {}
  try { campaigns = await api.get("/campaigns/mine"); } catch {}

  const active = orders.filter((o) => !["released", "cancelled"].includes(o.status)).length;
  const pendingApprovals = orders.filter((o) => o.status === "submitted").length;
  const totalSpent = orders.filter((o) => o.status === "released").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[460px] -z-10 brand-gradient-soft opacity-70 dark:opacity-50"
        style={{ maskImage: "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)" }}
      />
      <div aria-hidden className="absolute -top-24 right-0 h-[420px] w-[420px] -z-10 brand-mesh opacity-30 dark:opacity-40 blur-3xl pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <DashboardBrandBar
        role="brand"
        brandName={i.brand.name}
        consoleLabelEn="Brand console"
        consoleLabelAr="منصة العلامة"
      />
      <header className="mt-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted">{i.dashboard.welcome}</p>
          <h1 className="text-3xl font-black">
            {i.dashboard.hey} <span className="brand-text">{me.name.split(" ")[0]}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns/new" className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-surface">{i.dashboard.newCampaign}</Link>
          <Link href="/influencers" className="px-4 py-2.5 rounded-xl brand-gradient text-white font-semibold">{i.dashboard.hireCreator}</Link>
        </div>
      </header>

      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        {[
          [i.dashboard.kpis.activeBookings, String(active), `${orders.length} ${i.dashboard.kpis.totalLabel}`],
          [i.dashboard.kpis.pendingApprovals, String(pendingApprovals), i.dashboard.kpis.reviewNow],
          [i.dashboard.kpis.totalSpent, fmtMoney(totalSpent), i.dashboard.kpis.allTime],
          [i.dashboard.kpis.campaigns, String(campaigns.length), i.dashboard.kpis.openDraft],
        ].map(([l, v, sub]) => (
          <div key={l} className="rounded-2xl border border-brand-100 dark:border-brand-900/60 bg-elevated/90 backdrop-blur-sm p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:shadow-brand-900/30 transition">
            <p className="text-xs uppercase tracking-wide text-muted">{l}</p>
            <p className="text-3xl font-black mt-1">{v}</p>
            <p className="text-xs text-muted mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-elevated">
          <header className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-lg">{i.dashboard.recentOrders}</h2>
            <Link href="/orders" className="text-sm font-semibold text-brand">{i.common.viewAll}</Link>
          </header>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">{i.dashboard.noOrders} <Link href="/influencers" className="underline">{i.dashboard.findCreatorCta}</Link>.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => {
                const avatar = o.creator.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(o.creator.user.name)}`;
                return (
                  <li key={o.id} className="p-5 flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface shrink-0">
                      <Image src={avatar} alt={o.creator.user.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{o.creator.user.name}</p>
                      <p className="text-xs text-muted truncate">{o.package.title} · #{o.id.slice(0, 6)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      o.status === "released" ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                      : o.status === "submitted" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-brand-50 text-brand dark:bg-brand-900/40 dark:text-brand-200"
                    }`}>{i.status[o.status as keyof typeof i.status] ?? o.status.replace(/_/g, " ")}</span>
                    <Link href={`/orders/${o.id}`} className="font-bold text-sm hover:underline">{fmtMoney(o.amount)}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">{i.dashboard.myCampaigns}</h2>
            <Link href="/campaigns/new" className="text-sm font-semibold text-brand">{i.dashboard.addNew}</Link>
          </header>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted">{i.dashboard.noCampaigns}</p>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link href={`/campaigns/${c.id}`} className="block rounded-lg p-3 -mx-3 hover:bg-surface">
                    <p className="font-semibold truncate">{c.title}</p>
                    <p className="text-xs text-muted">{i.status[c.status as keyof typeof i.status] ?? c.status} · {c._count?.applications ?? 0} {i.campaigns.applicants}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}
