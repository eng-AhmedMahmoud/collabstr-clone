"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { validatePackage, serverErrorMessage, msg } from "@/lib/validation";

export function AddPackageForm() {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validatePackage({ title, price }, locale);
    if (invalid) { setError(invalid.message); setErrorField(invalid.field); return; }
    setPending(true);
    setError(null);
    setErrorField(null);
    try {
      const res = await fetch("/api/v1/creators/me/packages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Math.round(Number(price)),
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, body, locale));
        return;
      }
      setTitle("");
      setPrice("");
      setDescription("");
      router.refresh();
    } catch {
      setError(msg("network", locale));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid sm:grid-cols-2 gap-3">
      <label className="block sm:col-span-2">
        <span className="text-xs font-semibold">{i.packages.labelTitle}</span>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setError(null); setErrorField(null); }} aria-invalid={errorField === "title" || undefined} required placeholder="1 Instagram Reel" className={`mt-1 w-full px-3.5 py-3 rounded-xl border bg-elevated ${errorField === "title" ? "border-red-500 focus:border-red-500" : "border-border"}`} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">{i.packages.labelPrice}</span>
        <input type="number" value={price} onChange={(e) => { setPrice(e.target.value); setError(null); setErrorField(null); }} min={10} step={1} required aria-invalid={errorField === "price" || undefined} placeholder="500" className={`mt-1 w-full px-3.5 py-3 rounded-xl border bg-elevated ${errorField === "price" ? "border-red-500 focus:border-red-500" : "border-border"}`} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs font-semibold">{i.packages.labelDesc}</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
      </label>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="sm:col-span-2 px-5 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
        {pending ? i.common.saving : i.packages.add}
      </button>
    </form>
  );
}

export function RemovePackageButton({ packageId }: { packageId: string }) {
  const router = useRouter();
  const i = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function remove() {
    if (!confirm(i.packages.confirmRemove)) return;
    setPending(true);
    setError(false);
    try {
      const res = await fetch(`/api/v1/creators/me/packages/${packageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="text-end">
      <button type="button" onClick={remove} disabled={pending} className="text-sm text-red-600 font-semibold disabled:opacity-60">
        {i.packages.remove}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{i.packages.removeError}</p>}
    </div>
  );
}
