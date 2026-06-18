"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmtMoney } from "@/lib/format";
import type { ApiCreator } from "@/lib/types";

type Pkg = { id: string; title: string; price: number };

export function CheckoutForm({ creator, pkg }: { creator: ApiCreator; pkg: Pkg }) {
  const router = useRouter();
  const [step, setStep] = useState<"brief" | "payment" | "done">("brief");
  const [brief, setBrief] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fee = Math.round(pkg.price * 0.06);
  const total = pkg.price + fee;
  const avatar = creator.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(creator.username)}`;

  async function createOrder() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, brief }),
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
      const order = await res.json();
      setOrderId(order.id);
      setStep("payment");
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function pay() {
    if (!orderId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/pay`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Payment failed");
      setStep("done");
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8 mt-6">
      <div className="lg:col-span-3 space-y-5">
        {step === "brief" && (
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
            <h2 className="font-bold text-lg">Tell {creator.user.name.split(" ")[0]} about the work</h2>
            <label className="block">
              <span className="text-xs font-semibold">Brief</span>
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={6} placeholder="What should they show, say, or avoid? Include product link, key messages, deadlines." className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button onClick={createOrder} disabled={busy || brief.length < 10} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
              {busy ? "Creating…" : "Continue to payment"}
            </button>
          </section>
        )}

        {step === "payment" && (
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
            <h2 className="font-bold text-lg">Payment</h2>
            <p className="text-sm text-[#6b7280]">Demo: payment is stubbed. Clicking pay moves funds into escrow on the API.</p>
            <div className="grid grid-cols-3 gap-2">
              {["Card", "Apple Pay", "Google Pay"].map((m) => (
                <button key={m} className="rounded-xl border border-[#e5e7eb] p-3 text-sm font-semibold hover:border-[#0b0b14]">{m}</button>
              ))}
            </div>
            <Field label="Card number" placeholder="•••• •••• •••• 4242" disabled />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" placeholder="12 / 28" disabled />
              <Field label="CVC" placeholder="•••" disabled />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep("brief")} className="px-4 py-3 rounded-xl border border-[#e5e7eb] font-semibold">Back</button>
              <button onClick={pay} disabled={busy} className="flex-1 px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
                {busy ? "Processing…" : `Pay ${fmtMoney(total)}`}
              </button>
            </div>
            <p className="text-xs text-[#6b7280]">Funds held in escrow until you approve delivery.</p>
          </section>
        )}

        {step === "done" && orderId && (
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-3xl">✓</div>
            <h2 className="font-black text-2xl mt-4">Order placed</h2>
            <p className="text-[#6b7280] mt-1">{creator.user.name} has been notified.</p>
            <div className="flex gap-2 justify-center mt-6">
              <Link href={`/orders/${orderId}`} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">View order</Link>
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
              <Image src={avatar} alt={creator.user.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{creator.user.name}</p>
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
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <input {...rest} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb] bg-white disabled:bg-[#f7f7fb]" />
    </label>
  );
}
