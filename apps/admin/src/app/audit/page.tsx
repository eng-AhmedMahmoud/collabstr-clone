import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

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
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/audit"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title="Audit log" subtitle="All admin-triggered order events. Anything with [ADMIN] prefix lands here." />
      {rows.length === 0 ? (
        <Card><EmptyState title="No admin actions yet" body="Force-release, force-cancel, dispute decisions land here." /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
              <tr>
                <th className="text-left px-5 py-2">When</th>
                <th className="text-left px-5 py-2">Order</th>
                <th className="text-left px-5 py-2">New state</th>
                <th className="text-left px-5 py-2 pr-5">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                  <td className="px-5 py-3 text-[#8b8ba0] whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/orders/${r.order.id}`} className="font-mono text-xs font-semibold hover:text-violet-300">#{r.order.id.slice(0, 8)}</Link>
                    <p className="text-[11px] text-[#8b8ba0]">{r.order.brand.name}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold">{r.status.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-[#d1d1da] pr-5">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
