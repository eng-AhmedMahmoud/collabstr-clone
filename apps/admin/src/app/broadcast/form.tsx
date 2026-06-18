"use client";

import { useState } from "react";

export function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState<"" | "brand" | "creator" | "admin">("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/broadcast`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, role: role || undefined }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      const out = await res.json();
      setMsg(`Sent to ${out.sent} users.`);
      setTitle(""); setBody("");
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-[#8b8ba0]">Audience</span>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-[#0b0b14] border border-[#1f1f30]">
          <option value="">All users</option>
          <option value="brand">Brands only</option>
          <option value="creator">Creators only</option>
          <option value="admin">Admins only</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-[#8b8ba0]">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-[#0b0b14] border border-[#1f1f30]" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-[#8b8ba0]">Body</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} maxLength={2000} className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-[#0b0b14] border border-[#1f1f30]" />
      </label>
      {msg && <p className="text-sm text-[#d1d1da]">{msg}</p>}
      <button disabled={busy || !title || !body} className="px-5 py-2.5 rounded-lg brand-gradient text-white font-bold disabled:opacity-60">
        {busy ? "Sending…" : "Send broadcast"}
      </button>
    </form>
  );
}
