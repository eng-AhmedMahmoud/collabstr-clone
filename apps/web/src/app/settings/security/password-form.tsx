"use client";

import { useState } from "react";

export function PasswordForm() {
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
      setMsg("Password changed.");
      setCurrent(""); setNext("");
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
      <h2 className="font-bold text-lg">Change password</h2>
      <label className="block">
        <span className="text-xs font-semibold">Current password</span>
        <input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">New password</span>
        <input value={next} onChange={(e) => setNext(e.target.value)} type="password" minLength={8} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
      </label>
      {msg && <p className="text-sm text-[#6b7280]">{msg}</p>}
      <button disabled={busy} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
}
