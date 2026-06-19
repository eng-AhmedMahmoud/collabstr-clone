"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmtMoney } from "@/lib/format";
import { useT } from "@/components/locale-provider";
import type { ApiCreator } from "@/lib/types";

type Pkg = { id: string; title: string; price: number };

export function CheckoutForm({ creator, pkg }: { creator: ApiCreator; pkg: Pkg }) {
  const router = useRouter();
  const i = useT();
  const [step, setStep] = useState<"brief" | "payment" | "done">("brief");
  const [brief, setBrief] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fee = Math.round(pkg.price * 0.06);
  const total = pkg.price + fee;
  const avatar = creator.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(creator.username)}`;
  const firstName = creator.user.name.split(" ")[0];

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
          <section className="rounded-2xl border border-border bg-elevated p-6 space-y-3">
            <h2 className="font-bold text-lg">{i.checkout.brief.replace("{name}", firstName)}</h2>
            <label className="block">
              <span className="text-xs font-semibold">{i.checkout.briefLabel}</span>
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={6} placeholder={i.checkout.briefPlaceholder} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button onClick={createOrder} disabled={busy || brief.length < 10} className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
              {busy ? i.checkout.creating : i.checkout.continuePayment}
            </button>
          </section>
        )}

        {step === "payment" && (
          <section className="rounded-2xl border border-border bg-elevated p-6 space-y-3">
            <h2 className="font-bold text-lg">{i.checkout.payment}</h2>
            <p className="text-sm text-muted">{i.checkout.paymentStub}</p>
            <div className="grid grid-cols-3 gap-2">
              {[i.checkout.card, "Apple Pay", "Google Pay"].map((m) => (
                <button key={m} className="rounded-xl border border-border p-3 text-sm font-semibold hover:border-fg">{m}</button>
              ))}
            </div>
            <Field label={i.checkout.cardNumber} placeholder="•••• •••• •••• 4242" disabled />
            <div className="grid grid-cols-2 gap-3">
              <Field label={i.checkout.expiry} placeholder="12 / 28" disabled />
              <Field label={i.checkout.cvc} placeholder="•••" disabled />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep("brief")} className="px-4 py-3 rounded-xl border border-border font-semibold">{i.common.back}</button>
              <button onClick={pay} disabled={busy} className="flex-1 px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
                {busy ? i.checkout.processing : `${i.checkout.pay} ${fmtMoney(total)}`}
              </button>
            </div>
            <p className="text-xs text-muted">{i.checkout.escrowNote}</p>
          </section>
        )}

        {step === "done" && orderId && (
          <section className="rounded-2xl border border-border bg-elevated p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-3xl">✓</div>
            <h2 className="font-black text-2xl mt-4">{i.checkout.done}</h2>
            <p className="text-muted mt-1">{i.checkout.doneSub.replace("{name}", creator.user.name)}</p>
            <div className="flex gap-2 justify-center mt-6">
              <Link href={`/orders/${orderId}`} className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.checkout.viewOrder}</Link>
              <Link href="/messages" className="px-5 py-3 rounded-xl border border-border font-semibold">{i.checkout.messageCreator}</Link>
            </div>
          </section>
        )}
      </div>

      <aside className="lg:col-span-2">
        <div className="rounded-2xl border border-border bg-elevated p-5 sticky top-24">
          <h2 className="font-bold">{i.checkout.summary}</h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-surface">
              <Image src={avatar} alt={creator.user.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{creator.user.name}</p>
              <p className="text-xs text-muted">{creator.headline}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-sm border-t border-border pt-4">
            <li className="flex justify-between"><span>{pkg.title}</span><span>{fmtMoney(pkg.price)}</span></li>
            <li className="flex justify-between text-muted"><span>{i.orders.detail.serviceFee}</span><span>{fmtMoney(fee)}</span></li>
            <li className="flex justify-between font-bold text-base border-t border-border pt-3"><span>{i.orders.detail.total}</span><span>{fmtMoney(total)}</span></li>
          </ul>
          <ul className="mt-5 space-y-2 text-xs text-muted">
            {i.checkout.bullets.map((b) => (
              <li key={b}>✓ {b}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-fg/80">{label}</span>
      <input {...rest} className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated disabled:bg-surface" />
    </label>
  );
}
