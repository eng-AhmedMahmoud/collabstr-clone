import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in — Collabstr" };

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">collabstr</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">Welcome back</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">Pick up where you left off.</h2>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Collabstr clone</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">Log in</h1>
          <p className="text-[#6b7280] mt-1.5">Welcome back.</p>
          <LoginForm next={next} />
          <p className="mt-6 text-sm text-[#6b7280] text-center">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[#0b0b14] underline">Create an account</Link>
          </p>
          <p className="mt-2 text-xs text-[#6b7280] text-center">
            Demo brand: <code>brand@example.dev</code> · Demo creator: <code>ava@example.dev</code> · pwd <code>Password123!</code>
          </p>
        </div>
      </section>
    </div>
  );
}
