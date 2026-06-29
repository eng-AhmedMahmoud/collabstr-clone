"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function MobileNav({
  items,
  loginLabel,
  signupLabel,
  authed,
}: {
  items: NavItem[];
  loginLabel: string;
  signupLabel: string;
  authed: boolean;
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="web-mobile-drawer"
        className="md:hidden h-9 w-9 grid place-items-center rounded-lg border border-border text-fg/80 hover:text-fg"
      >
        <span aria-hidden>≡</span>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <aside
            id="web-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 end-0 w-72 max-w-[85vw] bg-bg border-s border-border flex flex-col"
          >
            <div className="px-5 h-16 flex items-center justify-between border-b border-border">
              <span className="font-black brand-text">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9 grid place-items-center rounded-lg border border-border text-fg/80 hover:text-fg"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={path === it.href ? "page" : undefined}
                      className="block px-3 py-2.5 rounded-lg text-base text-fg/85 hover:bg-surface hover:text-fg aria-[current=page]:bg-surface aria-[current=page]:text-fg"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {!authed && (
              <div className="p-3 border-t border-border flex flex-col gap-2">
                <Link
                  href="/login"
                  className="text-center px-4 py-2.5 rounded-full border border-brand-300 text-brand-700 dark:text-brand-300 text-sm font-bold"
                >
                  {loginLabel}
                </Link>
                <Link
                  href="/signup"
                  className="text-center px-5 py-2.5 rounded-full brand-gradient brand-glow text-white text-sm font-bold"
                >
                  {signupLabel}
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
