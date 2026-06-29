import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill, pillKindForStatus } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtDate } from "@/lib/format";
import { OrderAdminActions } from "./actions";
import { t as serverT } from "@/lib/i18n";

type Detail = {
  id: string;
  status: string;
  amount: number;
  serviceFee: number;
  brief: string;
  createdAt: string;
  brand: { id: string; name: string; email: string };
  creator: { id: string; username: string; user: { name: string; email: string } };
  package: { title: string };
  events: { id: string; status: string; note?: string | null; createdAt: string }[];
  deliveries: { id: string; url: string; note?: string | null; createdAt: string }[];
};

export const dynamic = "force-dynamic";

export default async function OrderDetailAdmin({
  params,
}: { params: Promise<{ id: string }> }) {
  const me = await getAdminSession();
  if (!me) redirect("/login");
  const i = await serverT();
  const { id } = await params;
  const api = await serverApi();
  let o: Detail;
  try { o = await api.get<Detail>(`/admin/orders/${id}`); }
  catch (e: any) { if (e?.status === 404) notFound(); throw e; }

  return (
    <Shell me={me}>
      <PageHeader
        title={i.orders.detail.backTpl.replace("{id}", o.id.slice(0, 8))}
        subtitle={i.orders.detail.subTpl.replace("{pkg}", o.package.title).replace("{date}", fmtDate(o.createdAt))}
        action={<Pill kind={pillKindForStatus(o.status)}>{o.status.replace(/_/g, " ")}</Pill>}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title={i.orders.detail.brief}>
            <p className="text-sm text-fg/85 whitespace-pre-wrap">{o.brief}</p>
          </Card>

          {o.deliveries.length > 0 && (
            <Card title={i.orders.detail.deliveries.replace("{n}", String(o.deliveries.length))} padding={false}>
              <ul className="divide-y divide-border">
                {o.deliveries.map((d) => (
                  <li key={d.id} className="px-5 py-3">
                    <a href={d.url} target="_blank" className="text-sm font-mono break-all text-emerald-300 hover:text-emerald-200">{d.url}</a>
                    {d.note && <p className="text-sm text-fg/85 mt-1">{d.note}</p>}
                    <p className="text-[11px] text-muted mt-1">{fmtDate(d.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title={i.orders.detail.activity} padding={false}>
            <ol className="px-5 py-3 space-y-3">
              {o.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="h-2 w-2 mt-2 rounded-full brand-gradient shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{e.status.replace(/_/g, " ")}</p>
                    {e.note && <p className="text-muted">{e.note}</p>}
                    <p className="text-[11px] text-muted">{fmtDate(e.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title={i.orders.detail.parties}>
            <p className="text-[10px] uppercase tracking-wider text-muted">{i.orders.detail.brand}</p>
            <p className="font-semibold">{o.brand.name}</p>
            <p className="text-xs text-muted mb-3">{o.brand.email}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">{i.orders.detail.creator}</p>
            <p className="font-semibold">{o.creator.user.name}</p>
            <p className="text-xs text-muted">{o.creator.user.email}</p>
            <Link href={`https://collabstr-web.localhost/${o.creator.username}`} target="_blank" className="text-xs text-emerald-300 mt-2 inline-block">{i.common.openProfile} →</Link>
          </Card>

          <Card title={i.orders.detail.money}>
            <ul className="text-sm space-y-1.5">
              <li className="flex justify-between"><span className="text-muted">{i.orders.detail.amount}</span><span className="font-bold">{fmtMoney(o.amount)}</span></li>
              <li className="flex justify-between"><span className="text-muted">{i.orders.detail.serviceFee}</span><span>{fmtMoney(o.serviceFee)}</span></li>
              <li className="flex justify-between border-t border-border pt-2 mt-2"><span>{i.orders.detail.total}</span><span className="font-bold">{fmtMoney(o.amount + o.serviceFee)}</span></li>
            </ul>
          </Card>

          <OrderAdminActions order={{ id: o.id, status: o.status }} />
        </aside>
      </div>
    </Shell>
  );
}
