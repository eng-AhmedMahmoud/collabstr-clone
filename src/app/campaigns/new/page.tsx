"use client";

import { useState } from "react";
import Link from "next/link";
import { PLATFORMS, CATEGORIES } from "@/lib/data";

export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const total = 4;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/campaigns" className="text-sm text-[#6b7280] hover:text-[#0b0b14]">← Back to campaigns</Link>
      <h1 className="text-3xl font-black mt-3">Post a campaign</h1>

      <ol className="flex items-center gap-2 mt-6">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <li key={n} className="flex-1">
            <div className={`h-1.5 rounded-full ${n <= step ? "brand-gradient" : "bg-[#e5e7eb]"}`} />
            <p className={`mt-1.5 text-xs font-semibold ${n <= step ? "text-[#0b0b14]" : "text-[#6b7280]"}`}>
              Step {n}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        {step === 1 && (
          <>
            <h2 className="font-bold text-xl">Brief</h2>
            <p className="text-sm text-[#6b7280] mt-1">Tell creators what you&apos;re building.</p>
            <div className="mt-5 space-y-3">
              <Field label="Campaign title" placeholder="Spring drop — sustainable activewear" />
              <Field label="Brand" placeholder="Wildbloom" />
              <label className="block">
                <span className="text-xs font-semibold text-[#374151]">Description</span>
                <textarea rows={5} placeholder="What should creators know, show, or say?" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200" />
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-bold text-xl">Platforms & format</h2>
            <p className="text-sm text-[#6b7280] mt-1">Pick where the content should live.</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <label key={p.value} className="cursor-pointer rounded-xl border border-[#e5e7eb] p-4 hover:border-[#0b0b14]">
                  <input type="checkbox" className="hidden" />
                  <div className="text-2xl">{p.icon}</div>
                  <p className="font-bold mt-2">{p.label}</p>
                </label>
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
                    <button key={c.label} className="text-sm px-3 py-1.5 rounded-full border border-[#e5e7eb] hover:border-[#0b0b14]">
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Audience location" placeholder="United States, Canada" />
              <Field label="Follower range" placeholder="10k – 500k" />
              <Field label="Audience age" placeholder="18 – 34" />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-bold text-xl">Budget & timeline</h2>
            <p className="text-sm text-[#6b7280] mt-1">How much, and by when?</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Min budget per creator ($)" placeholder="150" />
              <Field label="Max budget per creator ($)" placeholder="1200" />
              <Field label="Creators needed" placeholder="10" />
              <Field label="Deadline" type="date" />
            </div>
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
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl brand-gradient text-white font-semibold">
              Post campaign
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
    </label>
  );
}
