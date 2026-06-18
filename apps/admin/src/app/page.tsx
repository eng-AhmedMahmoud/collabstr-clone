import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, StatGrid, Pill, pillKindForStatus } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo, fmtNum } from "@/lib/format";

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
  const api = await serverApi();
  let data: Overview | null = null;
  try { data = await api.get<Overview>("/admin/overview"); } catch {}

  if (!data) {
    return (
      <Shell me={me}>
        <PageHeader title="Overview" subtitle="API not reachable" />
        <Card>
          <p className="text-sm text-[#8b8ba0]">Start the API + Postgres, then refresh.</p>
        </Card>
      </Shell>
    );
  }

  const t = data.totals;
  return (
    <Shell me={me}>
      <PageHeader title="Overview" subtitle={`Snapshot of the marketplace, last sync ${new Date().toLocaleTimeString()}`} />

      <StatGrid stats={[
        { label: "Users", value: fmtNum(t.users), sub: `${t.creators} creators · ${t.brands} brands` },
        { label: "Campaigns", value: fmtNum(t.campaigns), sub: "open + draft + closed" },
        { label: "Orders", value: fmtNum(t.orders), sub: "lifetime" },
        { label: "GMV", value: fmtMoney(t.gmv), sub: "released funds" },
        { label: "In escrow", value: fmtMoney(t.escrow), sub: "pending release", tone: "warn" },
        { label: "Open disputes", value: String(t.open_disputes), sub: t.open_disputes ? "needs review" : "all clear", tone: t.open_disputes ? "danger" : "success" },
      ]} />

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2">
          <Card title="Recent orders" action={<Link href="/orders" className="text-xs font-semibold text-violet-300 hover:text-violet-200">View all</Link>} padding={false}>
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
                <tr><th className="text-left px-5 py-2">Brand → Creator</th><th className="text-left px-5 py-2">Status</th><th className="text-right px-5 py-2">Amount</th><th className="text-right px-5 py-2 pr-5">When</th></tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                    <td className="px-5 py-3">
                      <Link href={`/orders/${o.id}`} className="font-semibold text-white hover:text-violet-300">{o.brand.name}</Link>
                      <span className="text-[#8b8ba0]"> → {o.creator.user.name}</span>
                    </td>
                    <td className="px-5 py-3"><Pill kind={pillKindForStatus(o.status)}>{o.status.replace(/_/g, " ")}</Pill></td>
                    <td className="px-5 py-3 text-right font-bold">{fmtMoney(o.amount)}</td>
                    <td className="px-5 py-3 text-right text-[#8b8ba0] pr-5">{fmtAgo(o.createdAt)}</td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8b8ba0] text-sm">No orders yet.</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Recent signups" action={<Link href="/users" className="text-xs font-semibold text-violet-300 hover:text-violet-200">All users</Link>} padding={false}>
          <ul className="divide-y divide-[#1f1f30]">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full brand-gradient grid place-items-center text-white text-xs font-bold">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-[11px] text-[#8b8ba0] truncate">{u.email}</p>
                </div>
                <Pill kind={u.role === "admin" ? "brand" : u.role === "creator" ? "warn" : "muted"}>{u.role}</Pill>
              </li>
            ))}
            {data.recentUsers.length === 0 && <li className="px-5 py-10 text-center text-[#8b8ba0] text-sm">No signups yet.</li>}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
