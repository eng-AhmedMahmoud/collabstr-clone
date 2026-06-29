import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, StatGrid, Pill, pillKindForStatus } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo, fmtNum } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

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

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/");
  const i = await serverT();
  const api = await serverApi();
  let data: Overview | null = null;
  try { data = await api.get<Overview>("/admin/overview"); } catch {}

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
  return (
    <Shell me={me}>
      <PageHeader title={i.overview.title} subtitle={i.overview.subTpl.replace("{time}", new Date().toLocaleTimeString())} />

      <StatGrid stats={[
        { label: i.overview.kpis.users, value: fmtNum(tot.users), sub: i.overview.kpis.creatorsBrands.replace("{c}", String(tot.creators)).replace("{b}", String(tot.brands)) },
        { label: i.overview.kpis.campaigns, value: fmtNum(tot.campaigns), sub: i.overview.kpis.anyStatus },
        { label: i.overview.kpis.orders, value: fmtNum(tot.orders), sub: i.overview.kpis.lifetime },
        { label: i.overview.kpis.gmv, value: fmtMoney(tot.gmv), sub: i.overview.kpis.released },
        { label: i.overview.kpis.inEscrow, value: fmtMoney(tot.escrow), sub: i.overview.kpis.pendingRelease, tone: "warn" },
        { label: i.overview.kpis.openDisputes, value: String(tot.open_disputes), sub: tot.open_disputes ? i.overview.kpis.needsReview : i.overview.kpis.allClear, tone: tot.open_disputes ? "danger" : "success" },
      ]} />

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2">
          <Card title={i.overview.recentOrders} action={<Link href="/orders" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">{i.common.viewAll}</Link>} padding={false}>
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
                <tr><th className="text-left px-5 py-2">{i.overview.brandArrowCreator}</th><th className="text-left px-5 py-2">{i.common.status}</th><th className="text-right px-5 py-2">{i.common.amount}</th><th className="text-right px-5 py-2 pr-5">{i.common.when}</th></tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                    <td className="px-5 py-3">
                      <Link href={`/orders/${o.id}`} className="font-semibold text-white hover:text-emerald-300">{o.brand.name}</Link>
                      <span className="text-muted"> → {o.creator.user.name}</span>
                    </td>
                    <td className="px-5 py-3"><Pill kind={pillKindForStatus(o.status)}>{o.status.replace(/_/g, " ")}</Pill></td>
                    <td className="px-5 py-3 text-right font-bold">{fmtMoney(o.amount)}</td>
                    <td className="px-5 py-3 text-right text-muted pr-5">{fmtAgo(o.createdAt)}</td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted text-sm">{i.overview.noOrders}</td></tr>}
              </tbody>
            </table>
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
