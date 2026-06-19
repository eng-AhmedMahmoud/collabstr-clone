import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtMoney } from "@/lib/format";
import { t } from "@/lib/i18n";

type Creator = { id: string; packages?: { id: string; title: string; price: number }[] };

export const metadata = { title: "Packages — Nakhla" };
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard/packages");
  if (me.role !== "creator" || !me.creatorUsername) redirect("/dashboard");

  const api = await serverApi();
  const me_profile = await api.get<Creator>(`/creators/by-username/${me.creatorUsername}`);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.packages.title}</h1>
      <p className="text-muted mt-1.5">{i.packages.sub}</p>

      <section className="mt-6 rounded-2xl border border-border bg-elevated">
        <ul className="divide-y divide-border">
          {(me_profile.packages ?? []).map((p) => (
            <li key={p.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold">{p.title}</p>
              </div>
              <p className="font-bold">{fmtMoney(p.price)}</p>
              <form action={`/api/packages/${p.id}/delete`} method="post">
                <button className="text-sm text-red-600 font-semibold">{i.packages.remove}</button>
              </form>
            </li>
          ))}
          {(me_profile.packages ?? []).length === 0 && (
            <li className="p-8 text-center text-sm text-muted">{i.packages.none}</li>
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-lg">{i.packages.addTitle}</h2>
        <form action="/api/packages/create" method="post" className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">{i.packages.labelTitle}</span>
            <input name="title" required placeholder="1 Instagram Reel" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold">{i.packages.labelPrice}</span>
            <input type="number" name="price" min={50} required placeholder="500" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold">{i.packages.labelDays}</span>
            <input type="number" name="days" min={1} placeholder="5" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">{i.packages.labelDesc}</span>
            <textarea name="description" rows={3} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
          </label>
          <button className="sm:col-span-2 px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.packages.add}</button>
        </form>
      </section>
    </div>
  );
}
