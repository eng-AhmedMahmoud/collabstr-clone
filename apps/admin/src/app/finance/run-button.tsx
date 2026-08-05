"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function RunReconciliationButton() {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/reconciliation/run`, {
        method: "POST",
        credentials: "include",
        // Always JSON (even `{}`) so cross-site "simple request" posts can't mimic this call.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        alert((detail as { message?: string } | null)?.message ?? i.finance.runFailed);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold disabled:opacity-50"
    >
      {busy ? i.finance.running : i.finance.runNow}
    </button>
  );
}
