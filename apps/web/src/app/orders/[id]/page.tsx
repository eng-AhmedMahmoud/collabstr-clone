import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { OrderActions } from "./actions";

type OrderDetail = {
  id: string;
  status: string;
  amount: number;
  serviceFee: number;
  brief: string;
  createdAt: string;
  deadline?: string | null;
  brandId: string;
  creator: { id: string; userId: string; username: string; user: { name: string; avatarUrl: string | null } };
  brand: { id: string; name: string; avatarUrl: string | null };
  package: { id: string; title: string };
  events: { id: string; status: string; note?: string | null; createdAt: string }[];
  deliveries: { id: string; url: string; note?: string | null; createdAt: string }[];
  review?: { rating: number; text: string } | null;
};

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const i = await t();
  const { id } = await params;
  const me = await getSession();
  if (!me) redirect(`/login?next=/orders/${id}`);
  const api = await serverApi();
  let o: OrderDetail;
  try { o = await api.get<OrderDetail>(`/orders/${id}`); }
  catch (e: any) { if (e?.status === 404) notFound(); throw e; }

  const total = o.amount + o.serviceFee;
  const isBrand = me.id === o.brandId;
  const counter = isBrand
    ? { name: o.creator.user.name, avatar: o.creator.user.avatarUrl, href: `/${o.creator.username}` }
    : { name: o.brand.name, avatar: o.brand.avatarUrl, href: "#" };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href={isBrand ? "/orders" : "/creator-dashboard/orders"} className="text-sm text-muted">← {i.orders.detail.back}</Link>

      <header className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{i.orders.detail.orderHash} #{o.id.slice(0, 6)}</h1>
          <p className="text-sm text-muted mt-1">{o.package.title}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-50 text-brand dark:bg-brand-900/40 dark:text-brand-200">{i.status[o.status as keyof typeof i.status] ?? o.status.replace(/_/g, " ")}</span>
      </header>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-elevated p-6">
            <header className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface">
                <Image src={counter.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(counter.name)}`} alt={counter.name} fill className="object-cover" />
              </div>
              <div>
                <Link href={counter.href} className="font-bold hover:text-brand">{counter.name}</Link>
                <p className="text-xs text-muted">{i.common.role}</p>
              </div>
              <Link href="/messages" className="ml-auto px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-surface">{i.orders.detail.message}</Link>
            </header>
            <h2 className="font-bold text-lg">{i.orders.detail.brief}</h2>
            <p className="text-fg/80 mt-2 whitespace-pre-wrap">{o.brief}</p>
            {o.deadline && <p className="text-xs text-muted mt-3">{i.orders.detail.deadline} {new Date(o.deadline).toLocaleDateString()}</p>}
          </section>

          {o.deliveries.length > 0 && (
            <section className="rounded-2xl border border-border bg-elevated p-6">
              <h2 className="font-bold text-lg mb-3">{i.orders.detail.deliveries}</h2>
              <ul className="space-y-3">
                {o.deliveries.map((d) => (
                  <li key={d.id} className="border border-border rounded-lg p-3">
                    <a href={d.url} target="_blank" className="text-sm font-semibold text-brand underline break-all">{d.url}</a>
                    {d.note && <p className="text-sm text-fg/80 mt-1">{d.note}</p>}
                    <p className="text-xs text-muted mt-1">{new Date(d.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-elevated p-6">
            <h2 className="font-bold text-lg mb-3">{i.orders.detail.activity}</h2>
            <ol className="space-y-3">
              {o.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="h-2 w-2 mt-2 rounded-full brand-gradient shrink-0" />
                  <div>
                    <p className="font-semibold">{i.status[e.status as keyof typeof i.status] ?? e.status.replace(/_/g, " ")}</p>
                    {e.note && <p className="text-muted">{e.note}</p>}
                    <p className="text-xs text-muted">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-elevated p-5">
            <h2 className="font-bold">{i.orders.detail.parties}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>{o.package.title}</span><span>{fmtMoney(o.amount)}</span></li>
              <li className="flex justify-between text-muted"><span>{i.orders.detail.serviceFee}</span><span>{fmtMoney(o.serviceFee)}</span></li>
              <li className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>{i.orders.detail.total}</span><span>{fmtMoney(total)}</span></li>
            </ul>
            <p className="text-xs text-muted mt-3">
              {["released", "cancelled"].includes(o.status) ? i.orders.detail.settled : i.orders.detail.escrowHeld}
            </p>
          </section>

          <OrderActions order={{ id: o.id, status: o.status }} isBrand={isBrand} />
        </aside>
      </div>
    </div>
  );
}
