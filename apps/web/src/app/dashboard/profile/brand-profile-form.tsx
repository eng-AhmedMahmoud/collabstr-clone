"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { validateBrandProfile, serverErrorMessage, msg } from "@/lib/validation";

export type BrandMe = {
  brandName: string | null;
  website: string | null;
  industry: string | null;
  about: string | null;
  logoUrl: string | null;
};

export function BrandProfileForm({ initial }: { initial: BrandMe }) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();

  const [brandName, setBrandName] = useState(initial.brandName ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [about, setAbout] = useState(initial.about ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onChange<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setError(null); setErrorField(null); setOk(false); };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateBrandProfile({ brandName, website, logoUrl }, locale);
    if (invalid) { setError(invalid.message); setErrorField(invalid.field); return; }
    setPending(true); setError(null); setErrorField(null); setOk(false);
    try {
      const res = await fetch("/api/v1/users/me/brand", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          website: website.trim(),
          industry: industry.trim(),
          about: about.trim(),
          logoUrl: logoUrl.trim(),
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, b, locale));
        return;
      }
      setOk(true);
      router.refresh();
    } catch {
      setError(msg("network", locale));
    } finally {
      setPending(false);
    }
  }

  const inputCls = (invalid: boolean) =>
    `mt-1 w-full px-3.5 py-3 rounded-xl border bg-elevated ${invalid ? "border-red-500 focus:border-red-500" : "border-border"}`;

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <section className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.brandProfile.brandName}</span>
          <input value={brandName} onChange={(e) => onChange(setBrandName)(e.target.value)} aria-invalid={errorField === "brandName" || undefined} placeholder={i.brandProfile.brandNamePh} className={inputCls(errorField === "brandName")} />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.brandProfile.website}</span>
            <input value={website} onChange={(e) => onChange(setWebsite)(e.target.value)} aria-invalid={errorField === "website" || undefined} placeholder={i.brandProfile.websitePh} className={inputCls(errorField === "website")} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.brandProfile.industry}</span>
            <input value={industry} onChange={(e) => onChange(setIndustry)(e.target.value)} placeholder={i.brandProfile.industryPh} className={inputCls(false)} />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.brandProfile.about}</span>
          <textarea value={about} onChange={(e) => onChange(setAbout)(e.target.value)} rows={4} placeholder={i.brandProfile.aboutPh} className={inputCls(false)} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.brandProfile.logoUrl}</span>
          <input value={logoUrl} onChange={(e) => onChange(setLogoUrl)(e.target.value)} aria-invalid={errorField === "logoUrl" || undefined} placeholder={i.brandProfile.logoPh} className={inputCls(errorField === "logoUrl")} />
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{i.brandProfile.saved}</p>}
      <button disabled={pending} className="px-6 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
        {pending ? i.common.saving : i.brandProfile.save}
      </button>
    </form>
  );
}
