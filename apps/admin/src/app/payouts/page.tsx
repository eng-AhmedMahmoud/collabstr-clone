import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";

type Row = {
  creator: { id: string; username: string; user: { name: string; email: string } };
  amount: number;
  orders: number;
};

export const metadata = { title: "Payouts · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/payouts");
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/payouts"); } catch {}

  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <Shell me={me}>
      <PageHeader title="Payouts" subtitle={`${rows.length} creators · ${fmtMoney(total)} released lifetime`} />
      {rows.length === 0 ? (
        <Card><EmptyState title="No payouts yet" body="Once orders move to released, the rollup appears here." /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
              <tr>
                <th className="text-left px-5 py-2">Creator</th>
                <th className="text-right px-5 py-2">Orders</th>
                <th className="text-right px-5 py-2 pr-5">Earned (released)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.creator.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                  <td className="px-5 py-3">
                    <p className="font-semibold">{r.creator.user.name}</p>
                    <p className="text-[11px] text-[#8b8ba0]">@{r.creator.username} · {r.creator.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right">{r.orders}</td>
                  <td className="px-5 py-3 text-right font-bold pr-5">{fmtMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
