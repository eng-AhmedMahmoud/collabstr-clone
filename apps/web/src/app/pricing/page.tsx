import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Pricing — Nakhla" };

export default async function PricingPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black">{i.pricing.title}</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          {i.pricing.sub}
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {i.pricing.tiers.map((tier, idx) => {
          const highlight = idx === 1;
          const href = idx === 2 ? "/contact" : "/signup";
          const period = idx === 1 ? i.pricing.mo : "";
          return (
            <div key={tier.name} className={`rounded-2xl p-6 border ${highlight ? "border-transparent brand-gradient text-white shadow-2xl scale-[1.02]" : "border-border bg-elevated"}`}>
              <p className={`text-sm font-semibold ${highlight ? "text-white/80" : "text-muted"}`}>{tier.name}</p>
              <p className="text-4xl font-black mt-1">{tier.price}<span className={`text-base font-medium ${highlight ? "text-white/80" : "text-muted"}`}>{period}</span></p>
              <p className={`mt-2 ${highlight ? "text-white/90" : "text-fg/80"}`}>{tier.blurb}</p>
              <ul className={`mt-5 space-y-2 text-sm ${highlight ? "text-white/90" : "text-fg/80"}`}>
                {tier.features.map((f) => (<li key={f}>✓ {f}</li>))}
              </ul>
              <Link href={href} className={`mt-6 inline-flex w-full justify-center px-4 py-3 rounded-xl font-bold ${
                highlight ? "bg-elevated text-fg" : "bg-fg text-white"
              }`}>{tier.cta}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
