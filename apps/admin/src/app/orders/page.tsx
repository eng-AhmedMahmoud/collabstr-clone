import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill, pillKindForStatus } from "@/components/ui";
import { ResponsiveTable } from "@/components/responsive-table";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";
import { t as serverT, getLocale } from "@/lib/i18n";

type Row = {
  id: string;
  status: string;
  amount: number;
  serviceFee: number;
  createdAt: string;
  brand: { name: string };
  creator: { user: { name: string } };
  package: { title: string };
};

export const metadata = { title: "Orders · Admin" };
export const dynamic = "force-dynamic";

const STATUS = [
  "pending_payment", "awaiting_creator", "in_progress", "submitted",
  "revision_requested", "approved", "released", "cancelled", "disputed",
];

export default async function OrdersAdmin({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/orders");
  const i = await serverT();
  const locale = await getLocale();
  const statusLabel = (s: string) => i.statuses.orders[s] ?? s.replace(/_/g, " ");
  const sp = await searchParams;
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>(`/admin/orders${sp.status ? `?status=${sp.status}` : ""}`); } catch {}

  return (
    <Shell me={me}>
      <PageHeader
        title={i.orders.title}
        subtitle={`${i.orders.countTpl.replace("{n}", String(rows.length))} ${sp.status ? `· ${i.orders.filterTpl.replace("{s}", statusLabel(sp.status))}` : ""}`}
      />

      <div role="group" aria-label={i.orders.title} className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/orders"
          aria-current={!sp.status ? "page" : undefined}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${!sp.status ? "bg-white text-bg border-white" : "border-border text-fg/85 hover:border-muted"}`}
        >
          {i.common.all}
        </Link>
        {STATUS.map((s) => (
          <Link
            key={s}
            href={`/orders?status=${s}`}
            aria-current={sp.status === s ? "page" : undefined}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${sp.status === s ? "bg-white text-bg border-white" : "border-border text-fg/85 hover:border-muted"}`}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      <Card padding={false}>
        <ResponsiveTable minWidth={820} className="border-0">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="text-start px-5 py-2">{i.orders.colOrder}</th>
                <th className="text-start px-5 py-2">{i.orders.colParties}</th>
                <th className="text-start px-5 py-2">{i.orders.colStatus}</th>
                <th className="text-end px-5 py-2">{i.orders.colAmount}</th>
                <th className="text-end px-5 py-2 pe-5">{i.orders.colWhen}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                  <td className="px-5 py-3">
                    <Link href={`/orders/${o.id}`} className="font-semibold font-mono text-xs hover:text-emerald-300">
                      #<bdi>{o.id.slice(0, 8)}</bdi>
                    </Link>
                    <p className="text-[11px] text-muted mt-0.5">{o.package.title}</p>
                  </td>
                  <td className="px-5 py-3 text-fg/85">
                    <p>{o.brand.name}</p>
                    <p className="text-[11px] text-muted">
                      <span className="rtl:hidden">→</span>
                      <span className="hidden rtl:inline">←</span>{" "}
                      {o.creator.user.name}
                    </p>
                  </td>
                  <td className="px-5 py-3"><Pill kind={pillKindForStatus(o.status)}>{statusLabel(o.status)}</Pill></td>
                  <td className="px-5 py-3 text-end font-bold">
                    <bdi>{fmtMoney(o.amount, locale)}</bdi>{" "}
                    <span className="text-[10px] text-muted font-normal">
                      +<bdi>{fmtMoney(o.serviceFee, locale)}</bdi> {i.orders.fee}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-end text-muted pe-5">{fmtAgo(o.createdAt, locale)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">{i.orders.none}</td></tr>}
            </tbody>
          </table>
        </ResponsiveTable>
      </Card>
    </Shell>
  );
}
