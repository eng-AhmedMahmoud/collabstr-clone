"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { validateApplication, serverErrorMessage, msg } from "@/lib/validation";

export function ApplyForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();
  const [price, setPrice] = useState("");
  const [pitch, setPitch] = useState("");
  const [pending, setPending] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateApplication({ price, pitch }, locale);
    if (invalid) { setMessage({ kind: "error", text: invalid.message }); setErrorField(invalid.field); return; }
    setPending(true);
    setMessage(null);
    setErrorField(null);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Math.round(Number(price)), pitch }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage({ kind: "error", text: serverErrorMessage(res.status, body, locale) });
        return;
      }
      setMessage({ kind: "ok", text: i.campaigns.detail.applied });
      setPrice("");
      setPitch("");
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: msg("network", locale) });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold">{i.campaigns.detail.yourPrice}</span>
        <input
          type="number"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setMessage(null); setErrorField(null); }}
          min={10}
          step={1}
          placeholder="500"
          required
          aria-invalid={errorField === "price" || undefined}
          className={`mt-1 w-full px-3.5 py-3 rounded-xl border bg-elevated ${errorField === "price" ? "border-red-500 focus:border-red-500" : "border-border"}`}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.campaigns.detail.pitch}</span>
        <textarea
          value={pitch}
          onChange={(e) => { setPitch(e.target.value); setMessage(null); setErrorField(null); }}
          rows={4}
          minLength={10}
          required
          aria-invalid={errorField === "pitch" || undefined}
          className={`mt-1 w-full px-3.5 py-3 rounded-xl border ${errorField === "pitch" ? "border-red-500 focus:border-red-500" : "border-border"}`}
          placeholder={i.campaigns.detail.pitchPlaceholder}
        />
      </label>
      {message && (
        <p className={`text-sm ${message.kind === "ok" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
      )}
      <button disabled={pending} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
        {pending ? i.common.sending : i.campaigns.detail.submitApp}
      </button>
    </form>
  );
}
