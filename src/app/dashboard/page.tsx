import Link from "next/link";
import Image from "next/image";
import { CREATORS } from "@/lib/data";
import { fmtMoney } from "@/lib/format";

export const metadata = { title: "Dashboard — Collabstr" };

const ORDERS = [
  { id: "ORD-1024", creator: CREATORS[0], status: "In progress", due: "Jun 22", total: 320 },
  { id: "ORD-1023", creator: CREATORS[5], status: "Awaiting approval", due: "Jun 19", total: 1800 },
  { id: "ORD-1018", creator: CREATORS[2], status: "Delivered", due: "Jun 14", total: 850 },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Welcome back</p>
          <h1 className="text-3xl font-black">Hey, Ahmed 👋</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns/new" className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] font-semibold hover:bg-[#f7f7fb]">+ New campaign</Link>
          <Link href="/influencers" className="px-4 py-2.5 rounded-xl brand-gradient text-white font-semibold">Hire a creator</Link>
        </div>
      </header>

      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        {[
          ["Active bookings", "3", "+1 this week"],
          ["Pending approvals", "2", "Review now"],
          ["Total spent", "$12,480", "this quarter"],
          ["Total reach", "4.6M", "across creators"],
        ].map(([l, v, sub]) => (
          <div key={l} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">{l}</p>
            <p className="text-3xl font-black mt-1">{v}</p>
            <p className="text-xs text-[#6b7280] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white">
          <header className="flex items-center justify-between p-5 border-b border-[#e5e7eb]">
            <h2 className="font-bold text-lg">Recent orders</h2>
            <Link href="/orders" className="text-sm font-semibold text-[#7c3aed]">View all</Link>
          </header>
          <ul className="divide-y divide-[#e5e7eb]">
            {ORDERS.map((o) => (
              <li key={o.id} className="p-5 flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#f3f4f6] shrink-0">
                  <Image src={o.creator.avatar} alt={o.creator.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{o.creator.name}</p>
                  <p className="text-xs text-[#6b7280]">{o.id} · due {o.due}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  o.status === "Delivered" ? "bg-emerald-50 text-emerald-700"
                  : o.status === "Awaiting approval" ? "bg-amber-50 text-amber-700"
                  : "bg-violet-50 text-[#7c3aed]"
                }`}>
                  {o.status}
                </span>
                <span className="font-bold">{fmtMoney(o.total)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <h2 className="font-bold text-lg">Suggested for you</h2>
          <p className="text-xs text-[#6b7280] mb-4">Based on your last booking</p>
          <ul className="space-y-3">
            {CREATORS.slice(8, 12).map((c) => (
              <li key={c.username}>
                <Link href={`/${c.username}`} className="flex items-center gap-3 group">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[#f3f4f6] shrink-0">
                    <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:text-[#7c3aed]">{c.name}</p>
                    <p className="text-xs text-[#6b7280] truncate">{c.headline}</p>
                  </div>
                  <p className="text-sm font-bold">{fmtMoney(c.startingPrice)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
