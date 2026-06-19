import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Forgot password — Nakhla" };

export default async function ForgotPasswordPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black">{i.forgot.title}</h1>
      <p className="text-muted mt-1.5">{i.forgot.sub}</p>
      <form className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold">{i.forgot.email}</span>
          <input type="email" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
        </label>
        <button className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold">{i.forgot.send}</button>
      </form>
      <p className="text-xs text-muted mt-4">{i.forgot.stub}</p>
      <p className="text-sm text-muted mt-6 text-center">
        {i.forgot.remembered} <Link href="/login" className="underline">{i.forgot.backLogin}</Link>
      </p>
    </div>
  );
}
