"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

type Row = { id: string; mawthooqStatus: string };

export function MawthooqReviewActions({ row }: { row: Row }) {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<null | "verified" | "rejected">(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { decision: mode };
      if (mode === "verified" && expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      if (note) body.note = note;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/mawthooq/${row.id}/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) alert((await res.json())?.message ?? "Failed");
      setMode(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (mode) {
    return (
      <div className="flex flex-col items-end gap-1.5 text-xs">
        {mode === "verified" && (
          <label className="flex flex-col items-end">
            <span className="text-[10px] text-muted">{i.mawthooq.expiryLabel}</span>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-0.5 px-2 py-1 rounded-lg border border-border bg-surface" />
          </label>
        )}
        {mode === "rejected" && (
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={i.mawthooq.noteLabel}
            className="w-52 px-2 py-1 rounded-lg border border-border bg-surface"
          />
        )}
        <div className="flex gap-1.5">
          <button disabled={busy} onClick={submit} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.mawthooq.confirm}</button>
          <button disabled={busy} onClick={() => setMode(null)} className="px-2.5 py-1 rounded-lg border border-border text-muted hover:bg-surface">{i.mawthooq.cancel}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2 text-xs">
      {row.mawthooqStatus !== "verified" && (
        <button onClick={() => setMode("verified")} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.mawthooq.verify}</button>
      )}
      {row.mawthooqStatus !== "rejected" && (
        <button onClick={() => setMode("rejected")} className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10">{i.mawthooq.reject}</button>
      )}
    </div>
  );
}
