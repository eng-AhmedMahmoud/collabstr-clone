import Link from "next/link";
import Image from "next/image";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fmtMoney } from "@/lib/format";

type OrderRow = {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  deadline?: string | null;
  creator: { user: { name: string; avatarUrl: string | null } };
  package: { title: string };
};

export const metadata = { title: "Dashboard · لوحة التحكم — Nakhla · نخلة" };
export const dynamic = "force-dynamic";

export default async function BrandDashboard() {
  const me = await getSession();
  if (!me) redirect("/login?next=/dashboard");
  if (me.role !== "brand") redirect("/creator-dashboard");

  const api = await serverApi();
  let orders: OrderRow[] = [];
  let campaigns: { id: string; title: string; status: string; _count?: { applications: number } }[] = [];
  try { orders = await api.get<OrderRow[]>("/orders"); } catch {}
  try { campaigns = await api.get("/campaigns/mine"); } catch {}

  const active = orders.filter((o) => !["released", "cancelled"].includes(o.status)).length;
  const pendingApprovals = orders.filter((o) => o.status === "submitted").length;
  const totalSpent = orders.filter((o) => o.status === "released").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted">أهلاً بعودتك · Welcome back</p>
          <h1 className="text-3xl font-black">
            مرحباً، <span className="brand-text">{me.name.split(" ")[0]}</span>
          </h1>
          <p className="text-xs text-muted mt-1">🇸🇦 KSA brand dashboard · جميع المبالغ بالريال السعودي</p>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns/new" className="px-4 py-2.5 rounded-xl border border-border font-semibold hover:bg-surface">+ حملة جديدة · New campaign</Link>
          <Link href="/influencers" className="px-4 py-2.5 rounded-xl brand-gradient text-white font-semibold">احجز مؤثر · Hire a creator</Link>
        </div>
      </header>

      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        {[
          ["الحجوزات النشطة · Active bookings", String(active), `${orders.length} total · إجمالي`],
          ["موافقات معلّقة · Pending approvals", String(pendingApprovals), "Review now · راجع الآن"],
          ["إجمالي الإنفاق · Total spent", fmtMoney(totalSpent), "all time · بالريال"],
          ["الحملات · Campaigns", String(campaigns.length), "open + draft · مفتوحة + مسودة"],
        ].map(([l, v, sub]) => (
          <div key={l} className="rounded-2xl border border-border bg-elevated p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{l}</p>
            <p className="text-3xl font-black mt-1">{v}</p>
            <p className="text-xs text-muted mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-elevated">
          <header className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-lg">آخر الطلبات · Recent orders</h2>
            <Link href="/orders" className="text-sm font-semibold text-brand">عرض الكل · View all</Link>
          </header>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">لا توجد طلبات بعد. <Link href="/influencers" className="underline">ابحث عن مؤثر</Link>.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => {
                const avatar = o.creator.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(o.creator.user.name)}`;
                return (
                  <li key={o.id} className="p-5 flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface shrink-0">
                      <Image src={avatar} alt={o.creator.user.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{o.creator.user.name}</p>
                      <p className="text-xs text-muted truncate">{o.package.title} · #{o.id.slice(0, 6)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      o.status === "released" ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                      : o.status === "submitted" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-brand-50 text-brand dark:bg-brand-900/40 dark:text-brand-200"
                    }`}>{o.status.replace(/_/g, " ")}</span>
                    <Link href={`/orders/${o.id}`} className="font-bold text-sm hover:underline">{fmtMoney(o.amount)}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">حملاتي · My campaigns</h2>
            <Link href="/campaigns/new" className="text-sm font-semibold text-brand">+ جديد · New</Link>
          </header>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted">لا توجد حملات. أطلق أول حملة سعودية الآن.</p>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link href={`/campaigns/${c.id}`} className="block rounded-lg p-3 -mx-3 hover:bg-surface">
                    <p className="font-semibold truncate">{c.title}</p>
                    <p className="text-xs text-muted">{c.status} · {c._count?.applications ?? 0} applicants</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
