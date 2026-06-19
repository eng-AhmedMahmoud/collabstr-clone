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
  creator: { user: { name: string } };
  package: { title: string };
};

export const metadata = { title: "Orders — Nakhla" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/orders");
  const api = await serverApi();
  let orders: OrderRow[] = [];
  try { orders = await api.get<OrderRow[]>("/orders"); } catch {}

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.orders.title}</h1>
      <div className="mt-6 rounded-2xl border border-border bg-elevated divide-y divide-border">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">{i.orders.noOrders} <Link href="/influencers" className="underline">{i.orders.findCreator}</Link>.</p>
        ) : orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="p-5 flex items-center gap-4 hover:bg-surface">
            <div className="flex-1">
              <p className="font-semibold">{o.creator.user.name}</p>
              <p className="text-xs text-muted">{o.package.title} · #{o.id.slice(0,6)} · {new Date(o.createdAt).toLocaleDateString("en-SA", { timeZone: "Asia/Riyadh" })}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              o.status === "released" ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
              : o.status === "submitted" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-brand-50 text-brand dark:bg-brand-900/40 dark:text-brand-200"
            }`}>{i.status[o.status as keyof typeof i.status] ?? o.status.replace(/_/g, " ")}</span>
            <span className="font-bold">{fmtMoney(o.amount)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
