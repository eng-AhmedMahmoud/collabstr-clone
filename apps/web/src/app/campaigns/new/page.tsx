"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLATFORMS, CATEGORIES } from "@/lib/data";

type Form = {
  title: string;
  description: string;
  brand: string;
  platforms: string[];
  categories: string[];
  budgetMin: string;
  budgetMax: string;
  creatorsNeeded: string;
  deadline: string;
};

const empty: Form = {
  title: "", description: "", brand: "",
  platforms: [], categories: [],
  budgetMin: "", budgetMax: "",
  creatorsNeeded: "10", deadline: "",
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const total = 4;
  const [f, setF] = useState<Form>(empty);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(key: "platforms" | "categories", value: string) {
    setF((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  async function submit() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          description: f.description,
          platforms: f.platforms,
          categories: f.categories,
          budgetMin: Number(f.budgetMin),
          budgetMax: Number(f.budgetMax),
          creatorsNeeded: Number(f.creatorsNeeded) || 1,
          deadline: f.deadline ? new Date(f.deadline).toISOString() : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      const camp = await res.json();
      router.push(`/campaigns/${camp.id}`);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/campaigns" className="text-sm text-[#6b7280] hover:text-[#0b0b14]">← Back to campaigns</Link>
      <h1 className="text-3xl font-black mt-3">Post a campaign</h1>

      <ol className="flex items-center gap-2 mt-6">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <li key={n} className="flex-1">
            <div className={`h-1.5 rounded-full ${n <= step ? "brand-gradient" : "bg-[#e5e7eb]"}`} />
            <p className={`mt-1.5 text-xs font-semibold ${n <= step ? "text-[#0b0b14]" : "text-[#6b7280]"}`}>Step {n}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        {step === 1 && (
          <>
            <h2 className="font-bold text-xl">Brief</h2>
            <p className="text-sm text-[#6b7280] mt-1">Tell creators what you&apos;re building.</p>
            <div className="mt-5 space-y-3">
              <Field label="Campaign title" value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="Spring drop — sustainable activewear" />
              <label className="block">
                <span className="text-xs font-semibold text-[#374151]">Description</span>
                <textarea
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                  rows={5}
                  placeholder="What creators should know, show, or say."
                  className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]"
                />
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-bold text-xl">Platforms</h2>
            <p className="text-sm text-[#6b7280] mt-1">Pick where content lives.</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => toggle("platforms", p.value)}
                  className={`p-4 rounded-xl border text-left ${
                    f.platforms.includes(p.value) ? "border-[#0b0b14] bg-[#f7f7fb]" : "border-[#e5e7eb] hover:border-[#0b0b14]"
                  }`}
                >
                  <div className="text-2xl">{p.icon}</div>
                  <p className="font-bold mt-2">{p.label}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-bold text-xl">Targeting</h2>
            <p className="text-sm text-[#6b7280] mt-1">Match with the right creators.</p>
            <div className="mt-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#374151] mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c.label}
                      onClick={() => toggle("categories", c.label)}
                      className={`text-sm px-3 py-1.5 rounded-full border ${
                        f.categories.includes(c.label) ? "border-[#0b0b14] bg-[#f7f7fb]" : "border-[#e5e7eb] hover:border-[#0b0b14]"
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-bold text-xl">Budget & timeline</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Min budget ($)" type="number" value={f.budgetMin} onChange={(v) => setF({ ...f, budgetMin: v })} placeholder="150" />
              <Field label="Max budget ($)" type="number" value={f.budgetMax} onChange={(v) => setF({ ...f, budgetMax: v })} placeholder="1200" />
              <Field label="Creators needed" type="number" value={f.creatorsNeeded} onChange={(v) => setF({ ...f, creatorsNeeded: v })} placeholder="10" />
              <Field label="Deadline" type="date" value={f.deadline} onChange={(v) => setF({ ...f, deadline: v })} />
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </>
        )}

        <div className="flex justify-between mt-7">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] font-semibold disabled:opacity-40"
          >
            Back
          </button>
          {step < total ? (
            <button onClick={() => setStep((s) => s + 1)} className="px-5 py-2.5 rounded-xl brand-gradient text-white font-semibold">
              Continue
            </button>
          ) : (
            <button onClick={submit} disabled={busy} className="px-5 py-2.5 rounded-xl brand-gradient text-white font-semibold disabled:opacity-60">
              {busy ? "Posting…" : "Post campaign"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]"
      />
    </label>
  );
}
