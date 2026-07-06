import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, ErrorBanner } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo, fmtCount, getLocale } from "@/lib/format";
import { Money } from "@/components/money";
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
  const locale = await getLocale();
  const api = await serverApi();
  let rows: Row[] = [];
  let apiError = false;
  try { rows = await api.get<Row[]>("/admin/brands"); } catch { apiError = true; }

  return (
    <Shell me={me}>
      <PageHeader title={i.brands.title} subtitle={`${fmtCount(rows.length, 200)} ${i.brands.countSuffix}`} />
      {apiError && <ErrorBanner title={i.common.apiError} body={i.common.apiErrorBody} />}
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
                <td className="px-5 py-3 text-right font-bold"><Money value={b.totalSpent} locale={locale === "ar" ? "ar-SA" : "en-SA"} /></td>
                <td className="px-5 py-3 text-right text-muted pr-5">{fmtAgo(b.createdAt, locale)}</td>
              </tr>
            ))}
            {rows.length === 0 && !apiError && <tr><td colSpan={4} className="px-5 py-12 text-center text-muted">{i.brands.none}</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
