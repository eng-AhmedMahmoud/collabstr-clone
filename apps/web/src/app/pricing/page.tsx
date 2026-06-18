import Link from "next/link";

export const metadata = { title: "Pricing — Nakhla" };

const TIERS = [
  {
    name: "Free · مجاني",
    price: "0 ر.س",
    period: "",
    blurb: "للعلامات التي تختبر السوق السعودي.",
    features: [
      "Browse 910,000+ KSA creators",
      "Direct messaging in Arabic & English",
      "SAR escrow on every booking",
      "Pay per project · ادفع لكل مشروع",
    ],
    cta: "ابدأ مجاناً · Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Growth · نمو",
    price: "189 ر.س",
    period: "/شهرياً",
    blurb: "للفرق التي تطلق حملات شهرية في المملكة.",
    features: [
      "كل مزايا الخطة المجانية",
      "Unlimited KSA-targeted campaigns",
      "Audience analytics export (CSV)",
      "Performance tracking across IG, TikTok, Snap",
      "Priority support · دعم سريع بالعربية",
    ],
    cta: "ابدأ التجربة · Start free trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Scale · مؤسسات",
    price: "Custom",
    period: "",
    blurb: "للوكالات والشركات الكبرى في السعودية.",
    features: [
      "Everything in Growth",
      "Team seats & role-based access",
      "Custom reporting · VAT invoicing",
      "Dedicated KSA account manager",
      "SLA · فاتورة ضريبية معتمدة",
    ],
    cta: "تواصل مع المبيعات · Talk to sales",
    href: "/contact",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black">أسعار واضحة بالريال.</h1>
        <p className="mt-2 text-lg font-semibold text-fg/80">Simple pricing. Pay in SAR.</p>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          لا توجد رسوم على الحجوزات المباشرة. ادفع فقط مقابل الباقة التي تحتاجها — بفاتورة ضريبية سعودية.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <div key={t.name} className={`rounded-2xl p-6 border ${t.highlight ? "border-transparent brand-gradient text-white shadow-2xl scale-[1.02]" : "border-border bg-elevated"}`}>
            <p className={`text-sm font-semibold ${t.highlight ? "text-white/80" : "text-muted"}`}>{t.name}</p>
            <p className="text-4xl font-black mt-1">{t.price}<span className={`text-base font-medium ${t.highlight ? "text-white/80" : "text-muted"}`}>{t.period}</span></p>
            <p className={`mt-2 ${t.highlight ? "text-white/90" : "text-fg/80"}`}>{t.blurb}</p>
            <ul className={`mt-5 space-y-2 text-sm ${t.highlight ? "text-white/90" : "text-fg/80"}`}>
              {t.features.map((f) => (<li key={f}>✓ {f}</li>))}
            </ul>
            <Link href={t.href} className={`mt-6 inline-flex w-full justify-center px-4 py-3 rounded-xl font-bold ${
              t.highlight ? "bg-elevated text-fg" : "bg-fg text-white"
            }`}>{t.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
