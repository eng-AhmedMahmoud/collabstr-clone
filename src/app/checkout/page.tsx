"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CREATORS } from "@/lib/data";
import { fmtMoney } from "@/lib/format";

export default function CheckoutPage() {
  const creator = CREATORS[0];
  const pkg = creator.packages[0];
  const fee = Math.round(pkg.price * 0.06);
  const total = pkg.price + fee;
  const [step, setStep] = useState<"details" | "payment" | "done">("details");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/${creator.username}`} className="text-sm text-[#6b7280]">← Back to profile</Link>
      <h1 className="text-3xl font-black mt-2">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8 mt-8">
        <div className="lg:col-span-3 space-y-5">
          {step === "details" && (
            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
              <h2 className="font-bold text-lg">Brief</h2>
              <Field label="Brand name" placeholder="Wildbloom Co." />
              <Field label="Product link" placeholder="https://wildbloom.com/spring" />
              <label className="block">
                <span className="text-xs font-semibold text-[#374151]">Notes for the creator</span>
                <textarea rows={5} placeholder="What should they show, say, or avoid?" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white" />
              </label>
              <Field label="Deadline" type="date" />
              <button onClick={() => setStep("payment")} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold">
                Continue to payment
              </button>
            </section>
          )}

          {step === "payment" && (
            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
              <h2 className="font-bold text-lg">Payment</h2>
              <div className="grid grid-cols-3 gap-2">
                {["Card", "Apple Pay", "Google Pay"].map((m) => (
                  <button key={m} className="rounded-xl border border-[#e5e7eb] p-3 text-sm font-semibold hover:border-[#0b0b14]">
                    {m}
                  </button>
                ))}
              </div>
              <Field label="Card number" placeholder="1234 5678 9012 3456" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" placeholder="MM / YY" />
                <Field label="CVC" placeholder="123" />
              </div>
              <Field label="Cardholder name" placeholder="Jane Doe" />
              <div className="flex gap-2">
                <button onClick={() => setStep("details")} className="px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold">Back</button>
                <button onClick={() => setStep("done")} className="flex-1 px-4 py-3 rounded-xl brand-gradient text-white font-bold">
                  Pay {fmtMoney(total)}
                </button>
              </div>
              <p className="text-xs text-[#6b7280]">
                Funds are held in escrow until you approve the deliverables.
              </p>
            </section>
          )}

          {step === "done" && (
            <section className="rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-3xl">✓</div>
              <h2 className="font-black text-2xl mt-4">Order confirmed</h2>
              <p className="text-[#6b7280] mt-1">{creator.name} has been notified. You&apos;ll get an update within 24 hours.</p>
              <div className="flex gap-2 justify-center mt-6">
                <Link href="/dashboard" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Go to dashboard</Link>
                <Link href="/messages" className="px-5 py-3 rounded-xl border border-[#e5e7eb] font-semibold">Message creator</Link>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 sticky top-24">
            <h2 className="font-bold">Order summary</h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-[#f3f4f6]">
                <Image src={creator.avatar} alt={creator.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{creator.name}</p>
                <p className="text-xs text-[#6b7280]">{creator.headline}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm border-t border-[#e5e7eb] pt-4">
              <li className="flex justify-between"><span>{pkg.title}</span><span>{fmtMoney(pkg.price)}</span></li>
              <li className="flex justify-between text-[#6b7280]"><span>Service fee</span><span>{fmtMoney(fee)}</span></li>
              <li className="flex justify-between font-bold text-base border-t border-[#e5e7eb] pt-3"><span>Total</span><span>{fmtMoney(total)}</span></li>
            </ul>
            <ul className="mt-5 space-y-2 text-xs text-[#6b7280]">
              <li>✓ Escrow protection</li>
              <li>✓ Free revisions</li>
              <li>✓ Money back if creator no-shows</li>
            </ul>
          </div>
        </aside>
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
