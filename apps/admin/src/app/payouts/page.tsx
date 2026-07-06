import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState, ErrorBanner } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { getLocale } from "@/lib/format";
import { Money } from "@/components/money";
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
  const locale = await getLocale();
  const api = await serverApi();
  let rows: Row[] = [];
  let apiError = false;
  try { rows = await api.get<Row[]>("/admin/payouts"); } catch { apiError = true; }

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const summaryParts = i.payouts.summaryTpl.replace("{n}", String(rows.length)).split("{amount}");

  return (
    <Shell me={me}>
      <PageHeader
        title={i.payouts.title}
        subtitle={
          <>
            {summaryParts[0]}
            <Money value={total} locale={locale === "ar" ? "ar-SA" : "en-SA"} />
            {summaryParts[1]}
          </>
        }
      />
      {apiError ? (
        <ErrorBanner title={i.common.apiError} body={i.common.apiErrorBody} />
      ) : rows.length === 0 ? (
        <Card><EmptyState title={i.payouts.none} body={i.payouts.noneBody} /></Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="text-left px-5 py-2">{i.payouts.colCreator}</th>
                <th className="text-right px-5 py-2">{i.payouts.colOrders}</th>
                <th className="text-right px-5 py-2 pr-5">{i.payouts.colEarned}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.creator.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                  <td className="px-5 py-3">
                    <p className="font-semibold">{r.creator.user.name}</p>
                    <p className="text-[11px] text-muted">@{r.creator.username} · {r.creator.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right">{r.orders}</td>
                  <td className="px-5 py-3 text-right font-bold pr-5"><Money value={r.amount} locale={locale === "ar" ? "ar-SA" : "en-SA"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Shell>
  );
}
