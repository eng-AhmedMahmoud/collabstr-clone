import Link from "next/link";
import { LogoutButton } from "./logout-button";
import type { Me } from "@collabstr/shared-types";
import { t } from "@/lib/i18n";

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
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-[#1f1f30] bg-[#0b0b14] flex flex-col">
        <div className="px-5 h-16 flex items-center gap-2 border-b border-[#1f1f30]">
          <span className="h-7 w-7 rounded-lg brand-gradient grid place-items-center text-white font-black text-sm">ن</span>
          <div>
            <p className="font-black tracking-tight leading-none">Nakhla <span className="text-[#8b8ba0] font-bold">نخلة</span></p>
            <p className="text-[10px] uppercase tracking-wider text-[#8b8ba0] mt-0.5">{i.brand.sub}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="text-[10px] uppercase tracking-wider text-[#8b8ba0] px-2 mb-1.5">{g.group}</p>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-[#d1d1da] hover:bg-[#161624] hover:text-white"
                    >
                      <span className="w-4 text-[#8b8ba0] text-center">{it.icon}</span>
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-[#1f1f30] flex items-center gap-2">
          <div className="h-8 w-8 rounded-full brand-gradient grid place-items-center text-white text-xs font-bold">
            {me.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{me.name}</p>
            <p className="text-[11px] text-[#8b8ba0] truncate">{me.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="h-16 border-b border-[#1f1f30] flex items-center justify-between px-6">
          <div className="flex items-center gap-3 text-sm text-[#8b8ba0]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {process.env.NODE_ENV === "production" ? i.nav.production : i.nav.development}
            </span>
            <span>·</span>
            <span>{i.nav.roleAdmin}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="https://collabstr-web.localhost" target="_blank" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1f1f30] text-[#d1d1da] hover:border-[#8b8ba0]">
              {i.nav.marketplace}
            </Link>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
