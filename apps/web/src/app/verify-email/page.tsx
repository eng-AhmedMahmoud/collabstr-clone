import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Verify email — Nakhla" };

export default async function VerifyEmailPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-full brand-gradient text-white grid place-items-center text-2xl">✉️</div>
      <h1 className="text-3xl font-black mt-4">{i.verifyEmail.title}</h1>
      <p className="text-muted mt-2">
        {i.verifyEmail.sub}
      </p>
      <Link href="/login" className="mt-6 inline-flex px-5 py-3 rounded-xl border border-border font-semibold">
        {i.verifyEmail.backLogin}
      </Link>
    </div>
  );
}
