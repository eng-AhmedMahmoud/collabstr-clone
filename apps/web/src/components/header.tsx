import Link from "next/link";
import { getSession } from "@/lib/session";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { BrandMark } from "./brand-mark";
import { t } from "@/lib/i18n";

export async function Header() {
  const me = await getSession();
  const i = await t();
  const items = [
    { href: "/influencers", label: i.nav.find },
    { href: "/campaigns", label: i.nav.campaigns },
    { href: "/for-creators", label: i.nav.forCreators },
    { href: "/pricing", label: i.nav.pricing },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl brand-gradient brand-glow grid place-items-center text-white p-1.5"><BrandMark className="h-full w-full" title="Nakhla" /></span>
          <span className="font-black tracking-tight text-lg text-fg">{i.brand.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-fg/80">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="hover:text-brand">{it.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          {me ? (
            <UserMenu me={me} />
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-brand-300 text-brand-700 dark:text-brand-300 text-sm font-bold hover:bg-brand-50 dark:hover:bg-brand-900/30 transition">{i.nav.login}</Link>
              <Link href="/signup" className="hidden sm:inline-flex items-center px-5 py-2 rounded-full brand-gradient brand-glow text-white text-sm font-bold hover:opacity-95 transition">{i.nav.signup}</Link>
            </>
          )}
          <MobileNav items={items} loginLabel={i.nav.login} signupLabel={i.nav.signup} authed={!!me} />
        </div>
      </div>
    </header>
  );
}
