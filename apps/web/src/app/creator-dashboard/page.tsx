import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";

type OrderRow = {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  brand: { name: string; avatarUrl: string | null };
  package: { title: string };
};

export const metadata = { title: "Creator dashboard — Nakhla" };
export const dynamic = "force-dynamic";

export default async function CreatorDashboard() {
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard");
  if (me.role !== "creator") redirect("/dashboard");

  const api = await serverApi();
  let orders: OrderRow[] = [];
  let applications: { id: string; status: string; price: number; campaign: { id: string; title: string } }[] = [];
  try { orders = await api.get<OrderRow[]>("/orders?role=creator"); } catch {}
  try { applications = await api.get("/applications/mine"); } catch {}

  const pendingDeliveries = orders.filter((o) => ["awaiting_creator", "in_progress", "revision_requested"].includes(o.status)).length;
  const released = orders.filter((o) => o.status === "released").reduce((s, o) => s + o.amount, 0);
  const inEscrow = orders.filter((o) => ["in_progress", "submitted", "approved"].includes(o.status)).reduce((s, o) => s + o.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="text-3xl font-black">Hey, {me.name.split(" ")[0]}</h1>
        </div>
        <div className="flex gap-2">
          {me.creatorUsername && (
            <Link href={`/${me.creatorUsername}`} className="px-4 py-2.5 rounded-xl border border-border font-semibold">Public profile</Link>
          )}
          <Link href="/creator-dashboard/packages" className="px-4 py-2.5 rounded-xl brand-gradient text-white font-semibold">Manage packages</Link>
        </div>
      </header>

      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        {[
          ["Active deliveries", String(pendingDeliveries), "to ship"],
          ["In escrow", fmtMoney(inEscrow), "pending release"],
          ["Total earned", fmtMoney(released), "all time"],
          ["Open applications", String(applications.filter((a) => a.status === "pending").length), `${applications.length} total`],
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
            <h2 className="font-bold text-lg">Order queue</h2>
            <Link href="/creator-dashboard/orders" className="text-sm font-semibold text-brand">View all</Link>
          </header>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => {
                const avatar = o.brand.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(o.brand.name)}`;
                return (
                  <li key={o.id} className="p-5 flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#f3f4f6] shrink-0">
                      <Image src={avatar} alt={o.brand.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{o.brand.name}</p>
                      <p className="text-xs text-muted truncate">{o.package.title} · #{o.id.slice(0, 6)}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand">{o.status.replace(/_/g, " ")}</span>
                    <Link href={`/orders/${o.id}`} className="font-bold text-sm hover:underline">{fmtMoney(o.amount)}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-5">
          <h2 className="font-bold text-lg mb-3">My applications</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-muted">No applications yet. <Link href="/campaigns" className="underline">Browse campaigns</Link>.</p>
          ) : (
            <ul className="space-y-3">
              {applications.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link href={`/campaigns/${a.campaign.id}`} className="block rounded-lg p-3 -mx-3 hover:bg-surface">
                    <p className="font-semibold truncate">{a.campaign.title}</p>
                    <p className="text-xs text-muted">{fmtMoney(a.price)} · {a.status}</p>
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
