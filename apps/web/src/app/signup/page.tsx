"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"brand" | "creator" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role, handle: role === "creator" ? handle : undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Signup failed");
      }
      router.refresh();
      router.push(role === "creator" ? "/creator-dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">collabstr</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">1.4M+ brands and creators</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">Join the marketplace built for modern creators.</h2>
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
          <p className="text-[#6b7280] mt-1.5">Takes less than 60 seconds.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(["brand", "creator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`p-4 rounded-xl border text-left transition ${role === r ? "border-[#0b0b14] bg-[#f7f7fb]" : "border-[#e5e7eb] hover:border-[#0b0b14]"}`}
              >
                <p className="font-bold capitalize">I&apos;m a {r}</p>
                <p className="text-xs text-[#6b7280] mt-1">
                  {r === "brand" ? "Hire creators, run campaigns." : "Get hired by brands."}
                </p>
              </button>
            ))}
          </div>

          {role && (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <Field label="Full name" value={name} onChange={setName} required placeholder="Jane Doe" />
              <Field label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@brand.com" />
              <Field label="Password" type="password" value={password} onChange={setPassword} required placeholder="8+ characters" />
              {role === "creator" && (
                <Field label="Primary handle" value={handle} onChange={setHandle} required placeholder="@yourhandle" />
              )}
              <p className="text-xs text-[#6b7280]">
                By creating an account you agree to our{" "}
                <Link className="underline" href="/terms">Terms</Link> and{" "}
                <Link className="underline" href="/privacy">Privacy Policy</Link>.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={loading} type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-[#6b7280] text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#0b0b14] underline">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white"
      />
    </label>
  );
}
