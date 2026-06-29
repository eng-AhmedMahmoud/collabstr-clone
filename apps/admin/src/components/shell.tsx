import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import type { Me } from "@collabstr/shared-types";
import { t } from "@/lib/i18n";

const MARKETPLACE_URL =
  process.env.NEXT_PUBLIC_WEB_URL ??
  (process.env.NODE_ENV === "production" ? "https://collabstr-clone.vercel.app" : "https://collabstr-web.localhost");

export async function Shell({ me, children }: { me: Me; children: React.ReactNode }) {
  const i = await t();
  const NAV: { group: string; items: { href: string; label: string; icon: string }[] }[] = [
    {
      group: i.nav.operate,
      items: [
        { href: "/", label: i.nav.overview, icon: "■" },
        { href: "/orders", label: i.nav.orders, icon: "◷" },
        { href: "/disputes", label: i.nav.disputes, icon: "▲" },
        { href: "/payouts", label: i.nav.payouts, icon: "↗" },
        { href: "/audit", label: i.nav.audit, icon: "≡" },
      ],
    },
    {
      group: i.nav.catalog,
      items: [
        { href: "/users", label: i.nav.users, icon: "◉" },
        { href: "/creators", label: i.nav.creators, icon: "✦" },
        { href: "/brands", label: i.nav.brands, icon: "▣" },
        { href: "/campaigns", label: i.nav.campaigns, icon: "◊" },
        { href: "/reviews", label: i.nav.reviews, icon: "★" },
      ],
    },
    {
      group: i.nav.system,
      items: [
        { href: "/flow-map", label: i.nav.flowMap, icon: "⟿" },
        { href: "/broadcast", label: i.nav.broadcast, icon: "✉" },
        { href: "/settings", label: i.nav.settings, icon: "⚙" },
      ],
    },
  ];

  return (
    <div className="min-h-screen md:flex relative overflow-x-clip">
      <div aria-hidden className="absolute inset-0 -z-10 brand-gradient-soft pointer-events-none" />
      <div aria-hidden className="absolute -top-32 -end-32 h-[520px] w-[520px] -z-10 brand-mesh opacity-50 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-40 -start-20 h-[420px] w-[420px] -z-10 brand-conic opacity-[0.06] blur-3xl pointer-events-none" />

      <MobileNav
        nav={NAV}
        brand="Nakhla"
        brandAr="نخلة"
        sub={i.brand.sub}
        marketplaceLabel={i.nav.marketplace}
        marketplaceHref={MARKETPLACE_URL}
      />

      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 border-e border-border bg-bg/80 backdrop-blur-md flex-col relative z-10">
        <div className="px-4 lg:px-5 h-16 flex items-center gap-3 border-b border-border min-w-0">
          <span className="h-9 w-9 rounded-xl brand-gradient brand-glow grid place-items-center text-white font-black text-lg shrink-0">ن</span>
          <div className="leading-tight min-w-0">
            <p className="font-black tracking-tight truncate">
              <span className="brand-text">Nakhla</span>
              <span className="text-muted font-bold ms-1">نخلة</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-brand-300 mt-0.5 truncate">{i.brand.sub}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="text-[10px] uppercase tracking-wider text-muted px-2 mb-1.5 truncate">{g.group}</p>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-fg/85 hover:bg-surface-2 hover:text-white transition-colors min-w-0"
                    >
                      <span className="w-4 text-brand-400/80 text-center shrink-0">{it.icon}</span>
                      <span className="truncate">{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-border flex items-center gap-2 bg-surface/40 min-w-0">
          <div className="h-8 w-8 rounded-full brand-gradient brand-glow grid place-items-center text-white text-xs font-bold shrink-0">
            {me.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{me.name}</p>
            <p className="text-[11px] text-muted truncate">{me.email}</p>
          </div>
          <div className="shrink-0"><LogoutButton /></div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 relative z-10">
        <div className="hidden md:flex sticky top-0 z-20 h-16 border-b border-border glass items-center justify-between gap-3 px-4 lg:px-6 min-w-0">
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-muted flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              {process.env.NODE_ENV === "production" ? i.nav.production : i.nav.development}
            </span>
            <span className="hidden lg:inline">·</span>
            <span className="truncate">{i.nav.roleAdmin}</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-900/50 border border-brand-800 text-brand-300 shrink-0">
              🇸🇦 KSA · SAR ر.س
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LocaleSwitcher />
            <Link
              href={MARKETPLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-800 bg-brand-900/40 text-brand-200 hover:border-brand-500 hover:text-white transition whitespace-nowrap"
            >
              {i.nav.marketplace}
            </Link>
          </div>
        </div>
        <div className="p-4 md:p-6 min-w-0 max-w-full">{children}</div>
      </main>
    </div>
  );
}
