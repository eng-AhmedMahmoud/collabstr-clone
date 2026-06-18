import Link from "next/link";

export const metadata = { title: "Pricing — Collabstr" };

const TIERS = [
  {
    name: "Free",
    price: "$0",
    blurb: "For brands testing the waters.",
    features: [
      "Browse 910,000+ creators",
      "Direct messaging",
      "Escrow on every booking",
      "Pay per project",
    ],
    cta: "Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    blurb: "For teams running monthly campaigns.",
    features: [
      "Everything in Free",
      "Unlimited campaigns",
      "Audience analytics export",
      "Performance tracking",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Scale",
    price: "Custom",
    blurb: "For agencies and enterprise brands.",
    features: [
      "Everything in Growth",
      "Team seats & roles",
      "Custom reporting",
      "Dedicated account manager",
      "SLA & invoicing",
    ],
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black">Simple pricing.</h1>
        <p className="text-[#6b7280] mt-3 max-w-xl mx-auto">
          No platform fees on direct bookings. Pay only for the plan you need.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <div key={t.name} className={`rounded-2xl p-6 border ${t.highlight ? "border-transparent brand-gradient text-white shadow-2xl scale-[1.02]" : "border-[#e5e7eb] bg-white"}`}>
            <p className={`text-sm font-semibold ${t.highlight ? "text-white/80" : "text-[#6b7280]"}`}>{t.name}</p>
            <p className="text-4xl font-black mt-1">{t.price}<span className={`text-base font-medium ${t.highlight ? "text-white/80" : "text-[#6b7280]"}`}>{t.price !== "Custom" ? "/mo" : ""}</span></p>
            <p className={`mt-2 ${t.highlight ? "text-white/90" : "text-[#374151]"}`}>{t.blurb}</p>
            <ul className={`mt-5 space-y-2 text-sm ${t.highlight ? "text-white/90" : "text-[#374151]"}`}>
              {t.features.map((f) => (<li key={f}>✓ {f}</li>))}
            </ul>
            <Link href={t.href} className={`mt-6 inline-flex w-full justify-center px-4 py-3 rounded-xl font-bold ${
              t.highlight ? "bg-white text-[#0b0b14]" : "bg-[#0b0b14] text-white"
            }`}>{t.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
