import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, StatGrid, Pill, pillKindForStatus } from "@/components/ui";
import { ResponsiveTable } from "@/components/responsive-table";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo, fmtNum } from "@/lib/format";
import { Money } from "@/components/money";
import { t as serverT, getLocale } from "@/lib/i18n";

type Overview = {
  totals: {
    users: number;
    creators: number;
    brands: number;
    campaigns: number;
    orders: number;
    gmv: number;
    escrow: number;
    open_disputes: number;
  };
  recentOrders: { id: string; status: string; amount: number; createdAt: string; brand: { name: string }; creator: { user: { name: string } } }[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
};

type Metrics = {
  funnel: { status: string; count: number }[];
  disputeRate: number;
  payoutLatency: { avgHours: number | null; p90Hours: number | null; sampled: number };
  gmvReleased: number;
  escrowHeld: number;
  slaBreaches: { submittedOver72h: number; disputedOver7d: number };
};

// Canonical order lifecycle — funnel rows render in this order.
const LIFECYCLE = [
  "pending_payment",
  "awaiting_creator",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "released",
  "cancelled",
  "disputed",
] as const;

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/");
  const i = await serverT();
  const locale = await getLocale();
  const statusLabel = (s: string) => i.statuses.orders[s] ?? s.replace(/_/g, " ");
  const api = await serverApi();
  let data: Overview | null = null;
  let metrics: Metrics | null = null;
  // Fetch in parallel; each call degrades independently (the metrics endpoint
  // may 404 while it's being rolled out).
  const [ovr, met] = await Promise.allSettled([
    api.get<Overview>("/admin/overview"),
    api.get<Metrics>("/admin/metrics"),
  ]);
  if (ovr.status === "fulfilled") data = ovr.value;
  if (met.status === "fulfilled") metrics = met.value;

  if (!data) {
    return (
      <Shell me={me}>
        <PageHeader title={i.overview.title} subtitle={i.overview.apiDown} />
        <Card>
          <p className="text-sm text-muted">{i.overview.apiDownBody}</p>
        </Card>
      </Shell>
    );
  }

  const tot = data.totals;
  const intl = locale === "ar" ? "ar-SA" : "en-SA";
  const nf = (n: number) => n.toLocaleString(intl, { maximumFractionDigits: 1 });
  const m = i.overview.metrics;
  // Defensive: the metrics endpoint is new — tolerate partial/missing fields.
  const funnel = [...(metrics?.funnel ?? [])].sort((a, b) => {
    const ia = LIFECYCLE.indexOf(a?.status as (typeof LIFECYCLE)[number]);
    const ib = LIFECYCLE.indexOf(b?.status as (typeof LIFECYCLE)[number]);
    return (ia === -1 ? LIFECYCLE.length : ia) - (ib === -1 ? LIFECYCLE.length : ib);
  });
  const maxFunnel = Math.max(1, ...funnel.map((f) => f?.count ?? 0));
  const lat = metrics?.payoutLatency;
  const sla = metrics?.slaBreaches;
  return (
    <Shell me={me}>
      <PageHeader title={i.overview.title} subtitle={i.overview.subTpl.replace("{time}", new Date().toLocaleTimeString())} />

      <StatGrid stats={[
        { label: i.overview.kpis.users, value: fmtNum(tot.users, locale), sub: i.overview.kpis.creatorsBrands.replace("{c}", String(tot.creators)).replace("{b}", String(tot.brands)) },
        { label: i.overview.kpis.campaigns, value: fmtNum(tot.campaigns, locale), sub: i.overview.kpis.anyStatus },
        { label: i.overview.kpis.orders, value: fmtNum(tot.orders, locale), sub: i.overview.kpis.lifetime },
        { label: i.overview.kpis.gmv, value: <Money value={tot.gmv} locale={locale === "ar" ? "ar-SA" : "en-SA"} className="[&_svg]:text-emerald-400" />, sub: i.overview.kpis.released },
        { label: i.overview.kpis.inEscrow, value: <Money value={tot.escrow} locale={locale === "ar" ? "ar-SA" : "en-SA"} />, sub: i.overview.kpis.pendingRelease, tone: "warn" },
        { label: i.overview.kpis.openDisputes, value: String(tot.open_disputes), sub: tot.open_disputes ? i.overview.kpis.needsReview : i.overview.kpis.allClear, tone: tot.open_disputes ? "danger" : "success" },
      ]} />

      {metrics ? (
        <>
          <div className="mt-3">
            <StatGrid stats={[
              {
                label: m.disputeRate,
                value: (metrics.disputeRate ?? 0).toLocaleString(intl, { style: "percent", maximumFractionDigits: 1 }),
                sub: m.ofAllOrders,
                tone: (metrics.disputeRate ?? 0) > 0.05 ? "danger" : undefined,
              },
              {
                label: m.payoutLatency,
                value: lat?.avgHours != null ? m.hoursTpl.replace("{h}", nf(lat.avgHours)) : "—",
                sub: lat?.p90Hours != null
                  ? m.p90Tpl.replace("{h}", nf(lat.p90Hours)).replace("{n}", String(lat?.sampled ?? 0))
                  : m.noLatency,
              },
              {
                label: m.slaSubmitted,
                value: fmtNum(sla?.submittedOver72h ?? 0, locale),
                sub: (sla?.submittedOver72h ?? 0) > 0 ? m.breached : m.allClear,
                tone: (sla?.submittedOver72h ?? 0) > 0 ? "danger" : "success",
              },
              {
                label: m.slaDisputed,
                value: fmtNum(sla?.disputedOver7d ?? 0, locale),
                sub: (sla?.disputedOver7d ?? 0) > 0 ? m.breached : m.allClear,
                tone: (sla?.disputedOver7d ?? 0) > 0 ? "danger" : "success",
              },
            ]} />
          </div>

          <div className="mt-6">
            <Card title={m.funnel} padding={false}>
              <ul className="divide-y divide-border">
                {funnel.map((f) => (
                  <li key={f.status} className="px-4 sm:px-5 py-2.5 flex items-center gap-3 min-w-0">
                    <span className="w-36 sm:w-44 shrink-0"><Pill kind={pillKindForStatus(f.status)}>{statusLabel(f.status)}</Pill></span>
                    <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden min-w-0">
                      <div className="h-full rounded-full brand-gradient" style={{ width: `${Math.max(2, ((f.count ?? 0) / maxFunnel) * 100)}%` }} />
                    </div>
                    <span className="w-14 text-end text-sm font-bold tabular-nums shrink-0">{fmtNum(f.count ?? 0, locale)}</span>
                  </li>
                ))}
                {funnel.length === 0 && <li className="px-5 py-8 text-center text-muted text-sm">{m.noFunnel}</li>}
              </ul>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted mt-3">{m.unavailable}</p>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-6 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <Card title={i.overview.recentOrders} action={<Link href="/orders" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">{i.common.viewAll}</Link>} padding={false}>
            <ResponsiveTable minWidth={620} className="border-0 rounded-none">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
                  <tr>
                    <th className="text-start px-4 sm:px-5 py-2">{i.overview.brandArrowCreator}</th>
                    <th className="text-start px-4 sm:px-5 py-2">{i.common.status}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.common.amount}</th>
                    <th className="text-end px-4 sm:px-5 py-2 pe-5">{i.common.when}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                      <td className="px-4 sm:px-5 py-3">
                        <Link href={`/orders/${o.id}`} className="font-semibold text-white hover:text-emerald-300">{o.brand.name}</Link>
                        <span className="text-muted">
                          {" "}<span className="rtl:hidden">→</span><span className="hidden rtl:inline">←</span>{" "}
                          {o.creator.user.name}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3"><Pill kind={pillKindForStatus(o.status)}>{statusLabel(o.status)}</Pill></td>
                      <td className="px-4 sm:px-5 py-3 text-end font-bold"><bdi><Money value={o.amount} locale={locale === "ar" ? "ar-SA" : "en-SA"} /></bdi></td>
                      <td className="px-4 sm:px-5 py-3 text-end text-muted pe-5">{fmtAgo(o.createdAt, locale)}</td>
                    </tr>
                  ))}
                  {data.recentOrders.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted text-sm">{i.overview.noOrders}</td></tr>}
                </tbody>
              </table>
            </ResponsiveTable>
          </Card>
        </div>

        <Card title={i.overview.recentSignups} action={<Link href="/users" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">{i.overview.allUsers}</Link>} padding={false}>
          <ul className="divide-y divide-border">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full brand-gradient grid place-items-center text-white text-xs font-bold">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-[11px] text-muted truncate">{u.email}</p>
                </div>
                <Pill kind={u.role === "admin" ? "brand" : u.role === "creator" ? "warn" : "muted"}>{u.role}</Pill>
              </li>
            ))}
            {data.recentUsers.length === 0 && <li className="px-5 py-10 text-center text-muted text-sm">{i.overview.noSignups}</li>}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
