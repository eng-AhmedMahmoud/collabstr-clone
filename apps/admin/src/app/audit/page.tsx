import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

type Row = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  order: { id: string; brand: { name: string } };
};

export const metadata = { title: "Audit log · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/audit");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/audit"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.audit.title} subtitle={i.audit.sub} />
      {rows.length === 0 ? (
        <Card><EmptyState title={i.audit.none} body={i.audit.noneBody} /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="text-left px-5 py-2">{i.audit.colWhen}</th>
                <th className="text-left px-5 py-2">{i.audit.colOrder}</th>
                <th className="text-left px-5 py-2">{i.audit.colNewState}</th>
                <th className="text-left px-5 py-2 pr-5">{i.audit.colNote}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                  <td className="px-5 py-3 text-muted whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/orders/${r.order.id}`} className="font-mono text-xs font-semibold hover:text-emerald-300">#{r.order.id.slice(0, 8)}</Link>
                    <p className="text-[11px] text-muted">{r.order.brand.name}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold">{r.status.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-fg/85 pr-5">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
