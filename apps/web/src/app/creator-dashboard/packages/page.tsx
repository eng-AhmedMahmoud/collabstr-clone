import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";

type Creator = { id: string; packages?: { id: string; title: string; price: number }[] };

export const metadata = { title: "Packages — Nakhla" };
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard/packages");
  if (me.role !== "creator" || !me.creatorUsername) redirect("/dashboard");

  const api = await serverApi();
  const me_profile = await api.get<Creator>(`/creators/by-username/${me.creatorUsername}`);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Your packages</h1>
      <p className="text-muted mt-1.5">Add the deliverables brands can book directly.</p>

      <section className="mt-6 rounded-2xl border border-border bg-elevated">
        <ul className="divide-y divide-border">
          {(me_profile.packages ?? []).map((p) => (
            <li key={p.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold">{p.title}</p>
              </div>
              <p className="font-bold">{fmtMoney(p.price)}</p>
              <form action={`/api/packages/${p.id}/delete`} method="post">
                <button className="text-sm text-red-600 font-semibold">Remove</button>
              </form>
            </li>
          ))}
          {(me_profile.packages ?? []).length === 0 && (
            <li className="p-8 text-center text-sm text-muted">No packages yet — add one below.</li>
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-lg">Add a package</h2>
        <form action="/api/packages/create" method="post" className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">Title</span>
            <input name="title" required placeholder="1 Instagram Reel" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold">Price ($)</span>
            <input type="number" name="price" min={10} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold">Delivery (days)</span>
            <input type="number" name="days" min={1} placeholder="5" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">Description</span>
            <textarea name="description" rows={3} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
          </label>
          <button className="sm:col-span-2 px-5 py-3 rounded-xl brand-gradient text-white font-bold">Add package</button>
        </form>
      </section>
    </div>
  );
}
