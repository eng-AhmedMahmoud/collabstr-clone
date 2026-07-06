"use client";

import { useState } from "react";
import { useT, useLocale } from "@/components/locale-provider";
import { serverErrorMessage, msg } from "@/lib/validation";
import { openConsentManager } from "@/components/cookie-consent";

export function PrivacyDataSection() {
  const i = useT();
  const locale = useLocale();
  const p = i.privacyData;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/v1/users/me/export", {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErr(serverErrorMessage(res.status, body, locale));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nakhla-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErr(msg("network", locale));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
      <h2 className="text-lg font-bold">{p.title}</h2>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{p.exportTitle}</div>
            <div className="text-xs text-muted mt-0.5">{p.exportDesc}</div>
          </div>
          <button
            onClick={download}
            disabled={busy}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors disabled:opacity-60"
          >
            {busy ? i.common.loading : p.exportBtn}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{p.cookieTitle}</div>
            <div className="text-xs text-muted mt-0.5">{p.cookieDesc}</div>
          </div>
          <button
            onClick={openConsentManager}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors"
          >
            {p.cookieBtn}
          </button>
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
      </div>
    </section>
  );
}
