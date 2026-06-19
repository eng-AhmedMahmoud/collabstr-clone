import Link from "next/link";
import { getSession } from "@/lib/session";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { t } from "@/lib/i18n";

export async function Header() {
  const me = await getSession();
  const i = await t();
  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl brand-gradient brand-glow grid place-items-center text-white font-black text-lg">ن</span>
          <span className="font-black tracking-tight text-lg text-fg">{i.brand.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-fg/80">
          <Link href="/influencers" className="hover:text-brand">{i.nav.find}</Link>
          <Link href="/campaigns" className="hover:text-brand">{i.nav.campaigns}</Link>
          <Link href="/for-creators" className="hover:text-brand">{i.nav.forCreators}</Link>
          <Link href="/pricing" className="hover:text-brand">{i.nav.pricing}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          {me ? (
            <UserMenu me={me} />
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-brand-300 text-brand-700 dark:text-brand-300 text-sm font-bold hover:bg-brand-50 dark:hover:bg-brand-900/30 transition">{i.nav.login}</Link>
              <Link href="/signup" className="inline-flex items-center px-5 py-2 rounded-full brand-gradient brand-glow text-white text-sm font-bold hover:opacity-95 transition">{i.nav.signup}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
