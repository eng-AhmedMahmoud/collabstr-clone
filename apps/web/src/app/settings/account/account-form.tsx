"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

export function AccountForm({ initialName, email, avatarUrl }: { initialName: string; email: string; avatarUrl: string | null }) {
  const router = useRouter();
  const i = useT();
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
      setMsg(i.settings.account.saved);
      router.refresh();
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="mt-6 rounded-2xl border border-border bg-elevated p-6 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.account.name}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.account.email}</span>
        <input value={email} disabled className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-muted" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.settings.account.avatar}</span>
        <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
      </label>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <button disabled={busy} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">{busy ? i.settings.account.saving : i.settings.account.save}</button>
    </form>
  );
}
