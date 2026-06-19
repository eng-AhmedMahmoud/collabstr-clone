import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PasswordForm } from "./password-form";
import { t } from "@/lib/i18n";

export const metadata = { title: "Security — Nakhla" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/security");
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.settings.security.title}</h1>
      <PasswordForm />
      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-lg">{i.settings.security.twoFa}</h2>
        <p className="text-sm text-muted mt-1">{i.settings.security.twoFaSub}</p>
        <button disabled className="mt-3 px-4 py-2.5 rounded-lg border border-border font-semibold opacity-60">{i.settings.security.enable}</button>
      </section>
    </div>
  );
}
