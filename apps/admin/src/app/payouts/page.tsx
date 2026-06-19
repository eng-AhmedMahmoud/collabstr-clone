import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

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
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/payouts"); } catch {}

  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <Shell me={me}>
      <PageHeader title={i.payouts.title} subtitle={i.payouts.summaryTpl.replace("{n}", String(rows.length)).replace("{amount}", fmtMoney(total))} />
      {rows.length === 0 ? (
        <Card><EmptyState title={i.payouts.none} body={i.payouts.noneBody} /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
              <tr>
                <th className="text-left px-5 py-2">{i.payouts.colCreator}</th>
                <th className="text-right px-5 py-2">{i.payouts.colOrders}</th>
                <th className="text-right px-5 py-2 pr-5">{i.payouts.colEarned}</th>
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
