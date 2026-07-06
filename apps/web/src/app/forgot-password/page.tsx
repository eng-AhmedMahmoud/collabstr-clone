import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Forgot password — Nakhla" };

export default async function ForgotPasswordPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black">{i.forgot.title}</h1>
      <div className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <p className="text-fg/80">{i.forgot.unavailable}</p>
        <Link href="/contact" className="mt-4 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95">
          {i.forgot.contactSupport}
        </Link>
      </div>
      <p className="text-sm text-muted mt-6 text-center">
        {i.forgot.remembered} <Link href="/login" className="underline">{i.forgot.backLogin}</Link>
      </p>
    </div>
  );
}
