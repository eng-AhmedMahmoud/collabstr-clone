import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

type Row = {
  id: string;
  brandName: string;
  user: { name: string; email: string };
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
};

export const metadata = { title: "Brands · Admin" };
export const dynamic = "force-dynamic";

export default async function BrandsAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/brands");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/brands"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.brands.title} subtitle={`${rows.length} ${i.brands.countSuffix}`} />
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="text-left px-5 py-2">{i.brands.colBrand}</th>
              <th className="text-right px-5 py-2">{i.brands.colOrders}</th>
              <th className="text-right px-5 py-2">{i.brands.colSpent}</th>
              <th className="text-right px-5 py-2 pr-5">{i.brands.colJoined}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                <td className="px-5 py-3">
                  <p className="font-semibold">{b.brandName}</p>
                  <p className="text-[11px] text-muted">{b.user.email}</p>
                </td>
                <td className="px-5 py-3 text-right">{b.totalOrders}</td>
                <td className="px-5 py-3 text-right font-bold">{fmtMoney(b.totalSpent)}</td>
                <td className="px-5 py-3 text-right text-muted pr-5">{fmtAgo(b.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-muted">{i.brands.none}</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
