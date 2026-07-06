"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, CATEGORIES } from "@/lib/data";
import { useT, useLocale } from "@/components/locale-provider";
import { validateCreatorProfile, serverErrorMessage, msg } from "@/lib/validation";

export type CreatorMe = {
  headline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  coverUrl: string | null;
  platforms: string[];
  categories: string[];
  followersIg: number | null;
  followersTt: number | null;
  followersYt: number | null;
  isAvailable: boolean;
};

export function CreatorProfileForm({ initial }: { initial: CreatorMe }) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();

  const [headline, setHeadline] = useState(initial.headline ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? "");
  const [platforms, setPlatforms] = useState<string[]>(initial.platforms ?? []);
  const [categories, setCategories] = useState<string[]>(initial.categories ?? []);
  const [followersIg, setFollowersIg] = useState(initial.followersIg != null ? String(initial.followersIg) : "");
  const [followersTt, setFollowersTt] = useState(initial.followersTt != null ? String(initial.followersTt) : "");
  const [followersYt, setFollowersYt] = useState(initial.followersYt != null ? String(initial.followersYt) : "");
  const [isAvailable, setIsAvailable] = useState(Boolean(initial.isAvailable));

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    setError(null); setErrorField(null); setOk(false);
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateCreatorProfile({ coverUrl, followersIg, followersTt, followersYt }, locale);
    if (invalid) { setError(invalid.message); setErrorField(invalid.field); return; }
    setPending(true); setError(null); setErrorField(null); setOk(false);
    try {
      const body: Record<string, unknown> = {
        headline: headline.trim(),
        bio: bio.trim(),
        city: city.trim(),
        country: country.trim(),
        coverUrl: coverUrl.trim(),
        platforms,
        categories,
        isAvailable,
      };
      const followerEntries = [
        ["followersIg", followersIg],
        ["followersTt", followersTt],
        ["followersYt", followersYt],
      ] as const;
      for (const [k, v] of followerEntries) if (v.trim()) body[k] = Math.round(Number(v));

      const res = await fetch("/api/v1/creators/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
          <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.headline}</span>
          <input value={headline} onChange={(e) => { setHeadline(e.target.value); setOk(false); }} placeholder={i.creatorProfile.headlinePh} className={inputCls(false)} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.bio}</span>
          <textarea value={bio} onChange={(e) => { setBio(e.target.value); setOk(false); }} rows={4} placeholder={i.creatorProfile.bioPh} className={inputCls(false)} />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.city}</span>
            <input value={city} onChange={(e) => { setCity(e.target.value); setOk(false); }} className={inputCls(false)} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.country}</span>
            <input value={country} onChange={(e) => { setCountry(e.target.value); setOk(false); }} className={inputCls(false)} />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.coverUrl}</span>
          <input value={coverUrl} onChange={(e) => { setCoverUrl(e.target.value); setError(null); setErrorField(null); setOk(false); }} aria-invalid={errorField === "coverUrl" || undefined} placeholder={i.creatorProfile.urlPh} className={inputCls(errorField === "coverUrl")} />
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-fg/80 mb-2">{i.creatorProfile.platforms}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLATFORMS.map((p) => (
              <button type="button" key={p.value} onClick={() => toggle(platforms, setPlatforms, p.value)}
                className={`p-3 rounded-xl border text-start ${platforms.includes(p.value) ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
                <span className="text-xl">{p.icon}</span>
                <p className="font-bold mt-1 text-sm">{locale === "ar" ? p.ar : p.label}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-fg/80 mb-2">{i.creatorProfile.categories}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.label} onClick={() => toggle(categories, setCategories, c.label)}
                className={`text-sm px-3 py-1.5 rounded-full border ${categories.includes(c.label) ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
                {c.emoji} {locale === "ar" ? c.ar : c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
        <p className="text-xs font-semibold text-fg/80">{i.creatorProfile.audience}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.followersIg}</span>
            <input type="number" min={0} step={1} value={followersIg} onChange={(e) => { setFollowersIg(e.target.value); setError(null); setErrorField(null); setOk(false); }} aria-invalid={errorField === "followersIg" || undefined} className={inputCls(errorField === "followersIg")} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.followersTt}</span>
            <input type="number" min={0} step={1} value={followersTt} onChange={(e) => { setFollowersTt(e.target.value); setError(null); setErrorField(null); setOk(false); }} aria-invalid={errorField === "followersTt" || undefined} className={inputCls(errorField === "followersTt")} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.creatorProfile.followersYt}</span>
            <input type="number" min={0} step={1} value={followersYt} onChange={(e) => { setFollowersYt(e.target.value); setError(null); setErrorField(null); setOk(false); }} aria-invalid={errorField === "followersYt" || undefined} className={inputCls(errorField === "followersYt")} />
          </label>
        </div>
        <div>
          <p className="text-xs font-semibold text-fg/80 mb-2">{i.creatorProfile.availability}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setIsAvailable(true); setOk(false); }}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${isAvailable ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
              {i.creatorProfile.available}
            </button>
            <button type="button" onClick={() => { setIsAvailable(false); setOk(false); }}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${!isAvailable ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
              {i.creatorProfile.unavailable}
            </button>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{i.creatorProfile.saved}</p>}
      <button disabled={pending} className="px-6 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
        {pending ? i.common.saving : i.creatorProfile.save}
      </button>
    </form>
  );
}
