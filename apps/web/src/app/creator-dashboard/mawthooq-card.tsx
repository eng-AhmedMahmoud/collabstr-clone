"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { validateLicense, serverErrorMessage, msg } from "@/lib/validation";

type Status = "none" | "pending" | "verified" | "rejected" | "expired";

const STATUS_STYLE: Record<Status, string> = {
  none: "bg-surface text-muted",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  verified: "bg-brand text-white",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

export function MawthooqCard({
  initialStatus,
  initialLicenseNo,
  reviewNote,
}: {
  initialStatus: Status;
  initialLicenseNo: string | null;
  reviewNote?: string | null;
}) {
  const i = useT();
  const locale = useLocale();
  const m = i.mawthooq;
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [licenseNo, setLicenseNo] = useState(initialLicenseNo ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  const canEdit = status === "none" || status === "rejected" || status === "expired";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const bad = validateLicense(licenseNo, locale);
    if (bad) { setErr(bad.message); setInvalid(true); return; }
    setBusy(true);
    setErr(null);
    setInvalid(false);
    try {
      const res = await fetch("/api/v1/creators/me/mawthooq", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErr(serverErrorMessage(res.status, body, locale));
        return;
      }
      setStatus("pending");
      router.refresh();
    } catch {
      setErr(msg("network", locale));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-elevated p-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="font-bold text-lg">{m.title}</h2>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[status]}`}>
          {m.status[status]}
        </span>
      </div>
      <p className="text-sm text-muted leading-relaxed">{m.desc}</p>

      {status === "pending" && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">{m.pendingNote}</p>}
      {status === "verified" && <p className="mt-3 text-sm text-brand">{m.verifiedNote}</p>}
      {status === "rejected" && reviewNote && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-300">{m.rejectedPrefix}{reviewNote}</p>
      )}

      {canEdit ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold">{m.licenseLabel}</span>
            <input
              value={licenseNo}
              onChange={(e) => { setLicenseNo(e.target.value); setErr(null); setInvalid(false); }}
              placeholder={m.placeholder}
              required
              minLength={4}
              maxLength={40}
              aria-invalid={invalid || undefined}
              className={`mt-1 w-full px-3.5 py-3 rounded-xl border bg-surface focus:bg-elevated focus:outline-none focus:ring-2 focus:ring-brand-200 ${invalid ? "border-red-500 focus:border-red-500" : "border-border"}`}
            />
          </label>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button
            disabled={busy}
            className="w-full px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60"
          >
            {busy ? m.submitting : status === "none" ? m.submit : m.resubmit}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm">
          <span className="text-muted">{m.licenseLabel}: </span>
          <span className="font-mono font-semibold" dir="ltr">{licenseNo}</span>
        </p>
      )}
    </section>
  );
}
