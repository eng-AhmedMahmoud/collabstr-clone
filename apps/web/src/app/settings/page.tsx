import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";

export const metadata = { title: "Settings — Nakhla" };
export const dynamic = "force-dynamic";

export default async function SettingsHub() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/settings");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.settings.title}</h1>
      <p className="text-muted mt-1">{i.settings.sub}</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {[
          { href: "/settings/account", title: i.settings.tiles.accountTitle, body: i.settings.tiles.accountBody },
          { href: "/settings/security", title: i.settings.tiles.securityTitle, body: i.settings.tiles.securityBody },
          { href: "/settings/notifications", title: i.settings.tiles.notifTitle, body: i.settings.tiles.notifBody },
          { href: "/settings/billing", title: i.settings.tiles.billingTitle, body: i.settings.tiles.billingBody },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="block rounded-2xl border border-border bg-elevated p-5 hover:shadow-sm hover:border-fg">
            <p className="font-bold text-lg">{s.title}</p>
            <p className="text-sm text-muted mt-1">{s.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
