import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

type Row = { id: string; status: string; amount: number; createdAt: string; brand: { name: string }; creator: { user: { name: string } } };

export const metadata = { title: "Disputes · Admin" };
export const dynamic = "force-dynamic";

export default async function DisputesAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/disputes");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/orders?status=disputed"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.disputes.title} subtitle={i.disputes.countTpl.replace("{n}", String(rows.length))} />
      {rows.length === 0 ? (
        <Card><EmptyState title={i.disputes.none} body={i.disputes.noneBody} /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
              <tr><th className="text-left px-5 py-2">{i.disputes.colOrder}</th><th className="text-left px-5 py-2">{i.disputes.colParties}</th><th className="text-right px-5 py-2">{i.disputes.colAmount}</th><th className="text-right px-5 py-2 pr-5">{i.disputes.colOpened}</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                  <td className="px-5 py-3">
                    <Link href={`/orders/${o.id}`} className="font-mono text-xs font-semibold hover:text-emerald-300">#{o.id.slice(0, 8)}</Link>
                    <div className="mt-1"><Pill kind="bad">{o.status.replace(/_/g, " ")}</Pill></div>
                  </td>
                  <td className="px-5 py-3"><p>{o.brand.name}</p><p className="text-[11px] text-muted">→ {o.creator.user.name}</p></td>
                  <td className="px-5 py-3 text-right font-bold">{fmtMoney(o.amount)}</td>
                  <td className="px-5 py-3 text-right text-muted pr-5">{fmtAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
