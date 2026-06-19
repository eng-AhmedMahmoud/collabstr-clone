import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";
import { t } from "@/lib/i18n";

type OrderRow = {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  brand: { name: string };
  package: { title: string };
};

export const metadata = { title: "My orders — Nakhla" };

export default async function CreatorOrdersPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard/orders");
  if (me.role !== "creator") redirect("/dashboard");
  const api = await serverApi();
  let orders: OrderRow[] = [];
  try { orders = await api.get<OrderRow[]>("/orders?role=creator"); } catch {}

  const GROUPS: { title: string; statuses: string[] }[] = [
    { title: i.orders.group.new, statuses: ["awaiting_creator"] },
    { title: i.orders.group.inProgress, statuses: ["in_progress", "revision_requested"] },
    { title: i.orders.group.submitted, statuses: ["submitted"] },
    { title: i.orders.group.approvedReleased, statuses: ["approved", "released"] },
    { title: i.orders.group.closed, statuses: ["cancelled", "disputed"] },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.nav.myOrders}</h1>

      {GROUPS.map(({ title, statuses }) => {
        const filtered = orders.filter((o) => statuses.includes(o.status));
        if (filtered.length === 0) return null;
        return (
          <section key={title} className="mt-8">
            <h2 className="font-bold text-lg mb-3">{title}</h2>
            <div className="rounded-2xl border border-border bg-elevated divide-y divide-border">
              {filtered.map((o) => (
                <Link key={o.id} href={`/orders/${o.id}`} className="p-5 flex items-center gap-4 hover:bg-surface">
                  <div className="flex-1">
                    <p className="font-semibold">{o.brand.name}</p>
                    <p className="text-xs text-muted">{o.package.title} · #{o.id.slice(0,6)}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand dark:bg-brand-900/40 dark:text-brand-200">{i.status[o.status as keyof typeof i.status] ?? o.status.replace(/_/g, " ")}</span>
                  <span className="font-bold">{fmtMoney(o.amount)}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {orders.length === 0 && <p className="text-center text-sm text-muted mt-12">{i.creatorDashboard.noOrders}</p>}
    </div>
  );
}
