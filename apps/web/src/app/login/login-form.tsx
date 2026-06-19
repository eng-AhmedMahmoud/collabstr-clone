"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const i = useT();
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
      // Sync the user's stored locale preference into the cookie so the next
      // server render uses it. The backend already sets this cookie itself,
      // but we mirror it here in case third-party cookies are blocked.
      if (user.locale === "ar" || user.locale === "en") {
        document.cookie = `locale=${user.locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
      }
      router.refresh();
      const fallback = user.role === "creator" ? "/creator-dashboard" : "/dashboard";
      const safe = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;
      router.push(safe);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-border font-semibold flex items-center justify-center gap-2 opacity-60">
        {i.login.googleSoon}
      </button>
      <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-border font-semibold flex items-center justify-center gap-2 opacity-60">
        {i.login.appleSoon}
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex-1 h-px bg-border" /> {i.login.or} <span className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.login.email}</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@brand.com" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.login.password}</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-fg/80"><input type="checkbox" /> {i.login.remember}</label>
          <Link href="/forgot-password" className="font-semibold text-brand hover:underline">{i.login.forgot}</Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
          {loading ? i.common.loading : i.login.submit}
        </button>
      </form>
    </div>
  );
}
