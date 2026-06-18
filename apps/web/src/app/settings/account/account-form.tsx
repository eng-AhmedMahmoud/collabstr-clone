"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountForm({ initialName, email, avatarUrl }: { initialName: string; email: string; avatarUrl: string | null }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(avatarUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: avatar }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      setMsg("Saved.");
      router.refresh();
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">Email</span>
        <input value={email} disabled className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-[#f7f7fb] text-[#6b7280]" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">Avatar URL</span>
        <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
      </label>
      {msg && <p className="text-sm text-[#6b7280]">{msg}</p>}
      <button disabled={busy} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}
