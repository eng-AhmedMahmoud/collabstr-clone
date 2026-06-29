import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill, pillKindForStatus } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

type Row = {
  id: string;
  title: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  createdAt: string;
  brand: { name: string };
  _count: { applications: number };
};

export const metadata = { title: "Campaigns · Admin" };
export const dynamic = "force-dynamic";

export default async function CampaignsAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/campaigns");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/campaigns"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.campaigns.title} subtitle={`${rows.length} ${i.campaigns.countSuffix}`} />
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="text-left px-5 py-2">{i.campaigns.colTitle}</th>
              <th className="text-left px-5 py-2">{i.campaigns.colBrand}</th>
              <th className="text-left px-5 py-2">{i.campaigns.colStatus}</th>
              <th className="text-right px-5 py-2">{i.campaigns.colApps}</th>
              <th className="text-right px-5 py-2">{i.campaigns.colBudget}</th>
              <th className="text-right px-5 py-2 pr-5">{i.campaigns.colPosted}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                <td className="px-5 py-3 font-semibold">{c.title}</td>
                <td className="px-5 py-3 text-fg/85">{c.brand.name}</td>
                <td className="px-5 py-3"><Pill kind={pillKindForStatus(c.status)}>{c.status}</Pill></td>
                <td className="px-5 py-3 text-right">{c._count.applications}</td>
                <td className="px-5 py-3 text-right">{fmtMoney(c.budgetMin)} – {fmtMoney(c.budgetMax)}</td>
                <td className="px-5 py-3 text-right text-muted pr-5">{fmtAgo(c.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">{i.campaigns.none}</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
