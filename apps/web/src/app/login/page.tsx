import Link from "next/link";
import { LoginForm } from "./login-form";
import { t } from "@/lib/i18n";

export const metadata = { title: "Log in — Nakhla" };

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string }> }) {
  const i = await t();
  const { next } = await searchParams;
  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">{i.brand.name}</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">{i.login.welcome}</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">{i.login.heroH2}</h2>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} {i.brand.name}</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">{i.login.title}</h1>
          <p className="text-muted mt-1.5">{i.login.sub}</p>
          <LoginForm next={next} />
          <p className="mt-6 text-sm text-muted text-center">
            {i.login.newHere}{" "}
            <Link href="/signup" className="font-semibold text-fg underline">{i.login.createOne}</Link>
          </p>
          <p className="mt-2 text-xs text-muted text-center">
            {i.login.demoLine}
          </p>
        </div>
      </section>
    </div>
  );
}
