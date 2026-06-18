import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtAgo } from "@/lib/format";

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
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/brands"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title="Brands" subtitle={`${rows.length} brand accounts`} />
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
            <tr>
              <th className="text-left px-5 py-2">Brand</th>
              <th className="text-right px-5 py-2">Orders</th>
              <th className="text-right px-5 py-2">Spent</th>
              <th className="text-right px-5 py-2 pr-5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                <td className="px-5 py-3">
                  <p className="font-semibold">{b.brandName}</p>
                  <p className="text-[11px] text-[#8b8ba0]">{b.user.email}</p>
                </td>
                <td className="px-5 py-3 text-right">{b.totalOrders}</td>
                <td className="px-5 py-3 text-right font-bold">{fmtMoney(b.totalSpent)}</td>
                <td className="px-5 py-3 text-right text-[#8b8ba0] pr-5">{fmtAgo(b.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-[#8b8ba0]">No brands yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
