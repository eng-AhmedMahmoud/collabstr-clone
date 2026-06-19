"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

export function OrderActions({ order, isBrand }: { order: { id: string; status: string }; isBrand: boolean }) {
  const router = useRouter();
  const i = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliverUrl, setDeliverUrl] = useState("");
  const [revisionNote, setRevisionNote] = useState("");

  async function call(path: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${order.id}/${path}`, {
        method: "POST",
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.message ?? `Failed (${res.status})`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-elevated p-5">
      <h2 className="font-bold">{i.orders.detail.actions}</h2>
      <div className="mt-3 space-y-2">
        {isBrand && order.status === "pending_payment" && (
          <button onClick={() => call("pay")} disabled={busy} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
            {i.orders.detail.payNow}
          </button>
        )}
        {!isBrand && order.status === "awaiting_creator" && (
          <button onClick={() => call("accept")} disabled={busy} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
            {i.orders.detail.accept}
          </button>
        )}
        {!isBrand && ["in_progress", "revision_requested"].includes(order.status) && (
          <div className="space-y-2">
            <input value={deliverUrl} onChange={(e) => setDeliverUrl(e.target.value)} placeholder={i.orders.detail.deliveryUrl} className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm" />
            <button onClick={() => call("submit", { url: deliverUrl })} disabled={busy || !deliverUrl} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
              {i.orders.detail.submitDelivery}
            </button>
          </div>
        )}
        {isBrand && order.status === "submitted" && (
          <>
            <button onClick={() => call("approve")} disabled={busy} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
              {i.orders.detail.approve}
            </button>
            <div className="space-y-2">
              <input value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} placeholder={i.orders.detail.revisionNote} className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm" />
              <button onClick={() => call("revision", { note: revisionNote })} disabled={busy || !revisionNote} className="w-full px-4 py-2.5 rounded-lg border border-fg text-fg font-semibold disabled:opacity-60">
                {i.orders.detail.requestRevision}
              </button>
            </div>
          </>
        )}
        {isBrand && order.status === "approved" && (
          <button onClick={() => call("release")} disabled={busy} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
            {i.orders.detail.releaseFunds}
          </button>
        )}
        {["pending_payment", "awaiting_creator", "in_progress", "revision_requested"].includes(order.status) && (
          <button onClick={() => call("cancel")} disabled={busy} className="w-full px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold text-sm disabled:opacity-60">
            {i.orders.detail.cancelOrder}
          </button>
        )}
        {["released", "cancelled"].includes(order.status) && (
          <p className="text-sm text-muted">{i.orders.detail.closedNote}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
