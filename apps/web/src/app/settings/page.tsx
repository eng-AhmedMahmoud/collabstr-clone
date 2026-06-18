import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = { title: "Settings — Nakhla" };
export const dynamic = "force-dynamic";

export default async function SettingsHub() {
  const me = await getSession();
  if (!me) redirect("/login?next=/settings");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Settings</h1>
      <p className="text-muted mt-1">Manage your account, billing, security, and notifications.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {[
          { href: "/settings/account", title: "Account", body: "Your name, email, avatar." },
          { href: "/settings/security", title: "Security", body: "Password, 2FA, active sessions." },
          { href: "/settings/notifications", title: "Notifications", body: "Email, push, in-app." },
          { href: "/settings/billing", title: "Billing", body: "Payment methods, invoices." },
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
