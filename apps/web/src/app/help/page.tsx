import Link from "next/link";

export const metadata = { title: "Help — Nakhla" };

export default function HelpPage() {
  const topics = [
    { t: "How escrow works", d: "Funds are captured at checkout and only released after you approve." },
    { t: "Cancel an order", d: "Either party can cancel before delivery. After delivery, cancellation needs both sides." },
    { t: "Request revisions", d: "Hit revision on the order page with a clear note. Free on every package." },
    { t: "Payouts as a creator", d: "Released funds appear in your earnings within 1–3 business days." },
    { t: "Disputes", d: "If you can't reach agreement, open a dispute — humans review within 48 hours." },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">Help center</h1>
      <p className="text-muted mt-2">Quick answers to common questions.</p>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-elevated">
        {topics.map((t) => (
          <details key={t.t} className="p-5 group">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              {t.t}<span className="text-muted group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-muted mt-3 text-sm leading-relaxed">{t.d}</p>
          </details>
        ))}
      </div>
      <p className="text-center text-sm text-muted mt-6">
        Still stuck? <Link href="/contact" className="underline">Contact support</Link>.
      </p>
    </div>
  );
}
