"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [role, setRole] = useState<"brand" | "creator" | null>(null);

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">collabstr</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">1.4M+ brands and creators</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">
            Join the marketplace built for modern creators.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            <li>✓ 0% platform fee on direct bookings for your first month</li>
            <li>✓ Built-in escrow protects every transaction</li>
            <li>✓ Tools for messaging, briefs, and content delivery</li>
          </ul>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Collabstr clone</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">Create your account</h1>
          <p className="text-[#6b7280] mt-1.5">It takes less than 60 seconds.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(["brand", "creator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`p-4 rounded-xl border text-left transition ${
                  role === r ? "border-[#0b0b14] bg-[#f7f7fb]" : "border-[#e5e7eb] hover:border-[#0b0b14]"
                }`}
              >
                <p className="font-bold capitalize">I&apos;m a {r}</p>
                <p className="text-xs text-[#6b7280] mt-1">
                  {r === "brand" ? "Hire creators and run campaigns." : "Get hired by brands."}
                </p>
              </button>
            ))}
          </div>

          {role && (
            <form className="mt-6 space-y-3">
              <button type="button" className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 hover:bg-[#f7f7fb]">
                <span>🟢</span> Continue with Google
              </button>
              <button type="button" className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 hover:bg-[#f7f7fb]">
                <span></span> Continue with Apple
              </button>
              <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                <span className="flex-1 h-px bg-[#e5e7eb]" /> or <span className="flex-1 h-px bg-[#e5e7eb]" />
              </div>
              <Field label="Full name" type="text" placeholder="Jane Doe" />
              <Field label="Email" type="email" placeholder="you@brand.com" />
              <Field label="Password" type="password" placeholder="At least 8 characters" />
              {role === "creator" && (
                <Field label="Primary platform handle" type="text" placeholder="@yourhandle" />
              )}
              <p className="text-xs text-[#6b7280]">
                By creating an account you agree to our <Link className="underline" href="/terms">Terms</Link> and{" "}
                <Link className="underline" href="/privacy">Privacy Policy</Link>.
              </p>
              <button type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold">
                Create account
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-[#6b7280] text-center">
            Already have an account? <Link href="/login" className="font-semibold text-[#0b0b14] underline">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
    </label>
  );
}
