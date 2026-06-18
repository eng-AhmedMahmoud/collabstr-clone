import Link from "next/link";

export const metadata = { title: "Log in — Collabstr" };

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">collabstr</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">Welcome back</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">
            Pick up where you left off.
          </h2>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Collabstr clone</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">Log in</h1>
          <p className="text-[#6b7280] mt-1.5">Welcome back. We missed you.</p>

          <div className="mt-6 space-y-3">
            <button type="button" className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 hover:bg-[#f7f7fb]">
              <span>🟢</span> Continue with Google
            </button>
            <button type="button" className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 hover:bg-[#f7f7fb]">
              <span></span> Continue with Apple
            </button>
            <div className="flex items-center gap-3 text-xs text-[#6b7280]">
              <span className="flex-1 h-px bg-[#e5e7eb]" /> or <span className="flex-1 h-px bg-[#e5e7eb]" />
            </div>

            <form className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-[#374151]">Email</span>
                <input type="email" placeholder="you@brand.com" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#374151]">Password</span>
                <input type="password" placeholder="••••••••" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200" />
              </label>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#374151]">
                  <input type="checkbox" /> Remember me
                </label>
                <Link href="/forgot" className="font-semibold text-[#7c3aed] hover:underline">Forgot password?</Link>
              </div>
              <button type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold">
                Log in
              </button>
            </form>
          </div>

          <p className="mt-6 text-sm text-[#6b7280] text-center">
            New here? <Link href="/signup" className="font-semibold text-[#0b0b14] underline">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
