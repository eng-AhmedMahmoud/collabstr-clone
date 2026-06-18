import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";

type Row = { id: string; status: string; amount: number; createdAt: string; brand: { name: string }; creator: { user: { name: string } } };

export const metadata = { title: "Disputes · Admin" };
export const dynamic = "force-dynamic";

export default async function DisputesAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/disputes");
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/orders?status=disputed"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title="Disputes" subtitle={`${rows.length} open · resolve from order detail`} />
      {rows.length === 0 ? (
        <Card><EmptyState title="No open disputes" body="Disputed orders surface here for human review." /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
              <tr><th className="text-left px-5 py-2">Order</th><th className="text-left px-5 py-2">Parties</th><th className="text-right px-5 py-2">Amount</th><th className="text-right px-5 py-2 pr-5">Opened</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                  <td className="px-5 py-3">
                    <Link href={`/orders/${o.id}`} className="font-mono text-xs font-semibold hover:text-violet-300">#{o.id.slice(0, 8)}</Link>
                    <div className="mt-1"><Pill kind="bad">disputed</Pill></div>
                  </td>
                  <td className="px-5 py-3"><p>{o.brand.name}</p><p className="text-[11px] text-[#8b8ba0]">→ {o.creator.user.name}</p></td>
                  <td className="px-5 py-3 text-right font-bold">{fmtMoney(o.amount)}</td>
                  <td className="px-5 py-3 text-right text-[#8b8ba0] pr-5">{fmtAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
