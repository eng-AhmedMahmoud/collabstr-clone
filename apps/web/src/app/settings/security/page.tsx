import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Security — Collabstr" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/security");
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Security</h1>
      <PasswordForm />
      <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="font-bold text-lg">Two-factor auth</h2>
        <p className="text-sm text-[#6b7280] mt-1">Roadmap — TOTP via authenticator apps.</p>
        <button disabled className="mt-3 px-4 py-2.5 rounded-lg border border-[#e5e7eb] font-semibold opacity-60">Enable 2FA</button>
      </section>
    </div>
  );
}
