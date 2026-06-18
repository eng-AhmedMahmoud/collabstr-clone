"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Login failed");
      }
      const user = await res.json();
      router.refresh();
      router.push(next || (user.role === "creator" ? "/creator-dashboard" : "/dashboard"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 opacity-60">
        Continue with Google (soon)
      </button>
      <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold flex items-center justify-center gap-2 opacity-60">
        Continue with Apple (soon)
      </button>
      <div className="flex items-center gap-3 text-xs text-[#6b7280]">
        <span className="flex-1 h-px bg-[#e5e7eb]" /> or <span className="flex-1 h-px bg-[#e5e7eb]" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-[#374151]">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@brand.com" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#374151]">Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white" />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#374151]"><input type="checkbox" /> Remember me</label>
          <Link href="/forgot-password" className="font-semibold text-[#7c3aed] hover:underline">Forgot password?</Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
