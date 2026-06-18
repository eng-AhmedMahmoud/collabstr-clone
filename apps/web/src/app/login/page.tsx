import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in — Nakhla" };

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">nakhla</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">Welcome back</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">Pick up where you left off.</h2>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Nakhla clone</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">Log in</h1>
          <p className="text-muted mt-1.5">Welcome back.</p>
          <LoginForm next={next} />
          <p className="mt-6 text-sm text-muted text-center">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-fg underline">Create an account</Link>
          </p>
          <p className="mt-2 text-xs text-muted text-center">
            Demo brand: <code>brand@example.dev</code> · Demo creator: <code>ava@example.dev</code> · pwd <code>Password123!</code>
          </p>
        </div>
      </section>
    </div>
  );
}
