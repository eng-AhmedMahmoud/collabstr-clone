"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "./locale-switcher";

type NavGroup = { group: string; items: { href: string; label: string; icon: string }[] };

export function MobileNav({
  nav,
  brand,
  brandAr,
  sub,
  marketplaceLabel,
  marketplaceHref,
}: {
  nav: NavGroup[];
  brand: string;
  brandAr: string;
  sub: string;
  marketplaceLabel: string;
  marketplaceHref: string;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 h-14 border-b border-border bg-bg/85 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg brand-gradient grid place-items-center text-white font-black">ن</span>
          <p className="font-black">
            <span className="brand-text">{brand}</span>
            <span className="text-muted font-bold ms-1 text-xs">{brandAr}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="admin-mobile-drawer"
            className="h-9 w-9 grid place-items-center rounded-lg border border-border text-fg/80 hover:text-fg"
          >
            <span aria-hidden>≡</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            id="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-bg border-e border-border flex flex-col"
          >
            <div className="px-5 h-14 flex items-center justify-between border-b border-border">
              <p className="font-black">
                <span className="brand-text">{brand}</span>
                <span className="text-muted font-bold ms-1 text-xs">{brandAr}</span>
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="h-9 w-9 grid place-items-center rounded-lg border border-border text-fg/80 hover:text-fg"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-brand-300 px-5 pt-3">{sub}</p>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {nav.map((g) => (
                <div key={g.group}>
                  <p className="text-[10px] uppercase tracking-wider text-muted px-2 mb-1.5">{g.group}</p>
                  <ul className="space-y-0.5">
                    {g.items.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          aria-current={path === it.href ? "page" : undefined}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-fg/85 hover:bg-surface-2 hover:text-white transition-colors aria-[current=page]:bg-surface-2 aria-[current=page]:text-white"
                        >
                          <span className="w-4 text-brand-400/80 text-center" aria-hidden>{it.icon}</span>
                          <span>{it.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <Link
              href={marketplaceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="m-3 text-center text-sm font-semibold px-3 py-2 rounded-lg border border-brand-800 bg-brand-900/40 text-brand-200 hover:border-brand-500 hover:text-white transition"
            >
              {marketplaceLabel}
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
