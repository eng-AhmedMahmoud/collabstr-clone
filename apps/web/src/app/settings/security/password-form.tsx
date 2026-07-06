"use client";

import { useState } from "react";
import { useT, useLocale } from "@/components/locale-provider";
import { validatePasswordChange, serverErrorMessage, msg as vmsg } from "@/lib/validation";

export function PasswordForm() {
  const i = useT();
  const locale = useLocale();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validatePasswordChange({ current, next }, locale);
    if (invalid) { setError(invalid.message); setMsg(null); setErrorField(invalid.field); return; }
    setBusy(true); setMsg(null); setError(null); setErrorField(null);
    try {
      const res = await fetch("/api/v1/users/me/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, body, locale));
        return;
      }
      setMsg(i.settings.security.changed);
      setCurrent(""); setNext("");
    } catch { setError(vmsg("network", locale)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-elevated p-6 space-y-3">
      <h2 className="font-bold text-lg">{i.settings.security.changePw}</h2>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.security.current}</span>
        <input value={current} onChange={(e) => { setCurrent(e.target.value); setError(null); setErrorField(null); }} type="password" required aria-invalid={errorField === "current" || undefined} className={`mt-1 w-full px-3.5 py-3 rounded-xl border ${errorField === "current" ? "border-red-500 focus:border-red-500" : "border-border"}`} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.security.next}</span>
        <input value={next} onChange={(e) => { setNext(e.target.value); setError(null); setErrorField(null); }} type="password" minLength={8} required aria-invalid={errorField === "next" || undefined} className={`mt-1 w-full px-3.5 py-3 rounded-xl border ${errorField === "next" ? "border-red-500 focus:border-red-500" : "border-border"}`} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <button disabled={busy} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">{busy ? i.settings.security.saving : i.settings.security.update}</button>
    </form>
  );
}
