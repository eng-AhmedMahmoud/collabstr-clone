"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Labels = { email: string; password: string; submit: string };

export function LoginForm({ next, labels }: { next?: string; labels: Labels }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Login failed");
      const me = await res.json();
      if (me.role !== "admin") {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
        router.push("/login?error=not_admin");
        return;
      }
      if (me.locale === "ar" || me.locale === "en") {
        document.cookie = `locale=${me.locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
      }
      router.refresh();
      // Defense in depth: server already sanitized `next` via safeNext().
      const safe = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/";
      router.push(safe);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-muted">{labels.email}</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border focus:border-emerald-500 focus:outline-none" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">{labels.password}</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border focus:border-emerald-500 focus:outline-none" />
      </label>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <button disabled={busy} className="w-full px-4 py-2.5 rounded-lg brand-gradient text-white font-bold disabled:opacity-60">
        {busy ? "…" : labels.submit}
      </button>
    </form>
  );
}
