"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function OrderAdminActions({ order }: { order: { id: string; status: string } }) {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  async function call(path: string, body?: unknown) {
    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/orders/${order.id}/${path}`, {
        method: "POST",
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) alert((await res.json())?.message ?? "Failed");
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold mb-3">{i.orders.detail.actions}</h2>
      <p className="text-xs text-muted mb-3">{i.orders.detail.actionsSub}</p>
      <div className="space-y-2">
        <button disabled={busy} onClick={() => call("force-release")} className="w-full px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/10">
          {i.orders.detail.forceRelease}
        </button>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={i.orders.detail.reasonNote} className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
        <button disabled={busy || !reason} onClick={() => call("force-cancel", { reason })} className="w-full px-3 py-2 rounded-lg border border-red-500/40 text-red-300 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50">
          {i.orders.detail.forceCancel}
        </button>
        <button disabled={busy || !reason} onClick={() => call("force-dispute", { reason })} className="w-full px-3 py-2 rounded-lg border border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-50">
          {i.orders.detail.forceDispute}
        </button>
      </div>
    </div>
  );
}
