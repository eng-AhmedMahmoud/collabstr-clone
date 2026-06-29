"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function BroadcastForm() {
  const i = useT();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [href, setHref] = useState("");
  const [role, setRole] = useState<"" | "brand" | "creator" | "admin">("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const allFilled = titleEn && titleAr && bodyEn && bodyAr;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/broadcast`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn, titleAr, bodyEn, bodyAr,
          href: href || undefined,
          role: role || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      const out = await res.json();
      setMsg(i.broadcast.sentTpl.replace("{n}", String(out.sent)));
      setTitleEn(""); setTitleAr(""); setBodyEn(""); setBodyAr(""); setHref("");
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={send} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold text-muted">{i.broadcast.audience}</span>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border">
          <option value="">{i.broadcast.audienceAll}</option>
          <option value="brand">{i.broadcast.audienceBrands}</option>
          <option value="creator">{i.broadcast.audienceCreators}</option>
          <option value="admin">{i.broadcast.audienceAdmins}</option>
        </select>
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">{i.broadcast.msgTitle} · EN</span>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" required maxLength={140}
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted">{i.broadcast.msgTitle} · AR</span>
          <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" required maxLength={140}
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">{i.broadcast.msgBody} · EN</span>
          <textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} dir="ltr" required rows={5} maxLength={2000}
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted">{i.broadcast.msgBody} · AR</span>
          <textarea value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} dir="rtl" required rows={5} maxLength={2000}
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border" />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted">Link (optional)</span>
        <input value={href} onChange={(e) => setHref(e.target.value)} dir="ltr" maxLength={500} placeholder="/orders/abc123"
          className="mt-1 w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border" />
      </label>

      {msg && <p className="text-sm text-fg/85">{msg}</p>}
      <div className="pt-3 border-t border-border">
      <button disabled={busy || !allFilled} className="px-5 py-2.5 rounded-lg brand-gradient text-white font-bold disabled:opacity-60">
        {busy ? i.broadcast.sending : i.broadcast.send}
      </button>
      </div>
    </form>
  );
}
