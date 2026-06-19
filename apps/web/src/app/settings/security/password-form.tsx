"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function PasswordForm() {
  const i = useT();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      setMsg(i.settings.security.changed);
      setCurrent(""); setNext("");
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-elevated p-6 space-y-3">
      <h2 className="font-bold text-lg">{i.settings.security.changePw}</h2>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.security.current}</span>
        <input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.security.next}</span>
        <input value={next} onChange={(e) => setNext(e.target.value)} type="password" minLength={8} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
      </label>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <button disabled={busy} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">{busy ? i.settings.security.saving : i.settings.security.update}</button>
    </form>
  );
}
