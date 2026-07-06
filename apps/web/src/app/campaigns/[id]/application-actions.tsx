"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { serverErrorMessage } from "@/lib/validation";

export function ApplicationActions({ applicationId, status }: { applicationId: string; status: string }) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(status);

  async function setStatus(next: "accepted" | "rejected") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/applications/${applicationId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, b, locale));
        return;
      }
      setCurrent(next);
      router.refresh();
    } catch {
      setError(i.campaigns.detail.statusError);
    } finally {
      setBusy(false);
    }
  }

  const badgeCls =
    current === "accepted" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    : current === "rejected" ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

  return (
    <div className="flex flex-col items-end gap-2">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeCls}`}>
        {i.status[current as keyof typeof i.status] ?? current}
      </span>
      {current === "pending" && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setStatus("accepted")} disabled={busy}
            className="px-3 py-1.5 rounded-lg brand-gradient text-white text-xs font-bold disabled:opacity-60">{i.campaigns.detail.accept}</button>
          <button type="button" onClick={() => setStatus("rejected")} disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface disabled:opacity-60">{i.campaigns.detail.reject}</button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
