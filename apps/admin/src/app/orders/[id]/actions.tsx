"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderAdminActions({ order }: { order: { id: string; status: string } }) {
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
      <h2 className="font-bold mb-3">Admin actions</h2>
      <p className="text-xs text-[#8b8ba0] mb-3">Force state changes. Bypasses normal guards.</p>
      <div className="space-y-2">
        <button disabled={busy} onClick={() => call("force-release")} className="w-full px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/10">
          Force release escrow
        </button>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason / note" className="w-full px-3 py-2 rounded-lg bg-[#0b0b14] border border-[#1f1f30] text-sm" />
        <button disabled={busy || !reason} onClick={() => call("force-cancel", { reason })} className="w-full px-3 py-2 rounded-lg border border-red-500/40 text-red-300 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50">
          Force cancel + refund
        </button>
        <button disabled={busy || !reason} onClick={() => call("force-dispute", { reason })} className="w-full px-3 py-2 rounded-lg border border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-50">
          Mark disputed
        </button>
      </div>
    </div>
  );
}
