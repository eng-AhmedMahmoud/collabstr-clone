import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Money } from "@/components/money";
import { t, getLocale } from "@/lib/i18n";
import { AddPackageForm, RemovePackageButton } from "./package-forms";

type Creator = { id: string; packages?: { id: string; title: string; price: number }[] };

export const metadata = { title: "Packages — Nakhla" };
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const i = await t();
  const locale = await getLocale();
  const moneyLocale = locale === "ar" ? "ar-SA" : "en-SA";
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard/packages");
  if (me.role !== "creator" || !me.creatorUsername) redirect("/dashboard");

  const api = await serverApi();
  let profile: Creator | null = null;
  try {
    profile = await api.get<Creator>(`/creators/by-username/${me.creatorUsername}`);
  } catch {
    profile = null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.packages.title}</h1>
      <p className="text-muted mt-1.5">{i.packages.sub}</p>

      {!profile ? (
        <p className="mt-8 text-center text-sm text-muted">{i.common.loadError}</p>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-elevated">
            <ul className="divide-y divide-border">
              {(profile.packages ?? []).map((p) => (
                <li key={p.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{p.title}</p>
                  </div>
                  <Money value={p.price} locale={moneyLocale} className="font-bold" />
                  <RemovePackageButton packageId={p.id} />
                </li>
              ))}
              {(profile.packages ?? []).length === 0 && (
                <li className="p-8 text-center text-sm text-muted">{i.packages.none}</li>
              )}
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
            <h2 className="font-bold text-lg">{i.packages.addTitle}</h2>
            <AddPackageForm />
          </section>
        </>
      )}
    </div>
  );
}
