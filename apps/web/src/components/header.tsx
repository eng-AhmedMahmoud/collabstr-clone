import Link from "next/link";
import { getSession } from "@/lib/session";
import { UserMenu } from "./user-menu";

export async function Header() {
  const me = await getSession();
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7eb] glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg brand-gradient grid place-items-center text-white font-black">C</span>
          <span className="font-black tracking-tight text-lg">collabstr</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#374151]">
          <Link href="/influencers" className="hover:text-[#7c3aed]">Find Creators</Link>
          <Link href="/campaigns" className="hover:text-[#7c3aed]">Campaigns</Link>
          <Link href="/for-creators" className="hover:text-[#7c3aed]">For Creators</Link>
          <Link href="/pricing" className="hover:text-[#7c3aed]">Pricing</Link>
          <Link href="/flow-map" className="hover:text-[#7c3aed] inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full brand-gradient" /> Flow map
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {me ? (
            <UserMenu me={me} />
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex px-3 py-2 text-sm font-semibold text-[#374151] hover:text-[#0b0b14]">
                Log in
              </Link>
              <Link href="/signup" className="inline-flex items-center px-4 py-2 rounded-full brand-gradient text-white text-sm font-semibold shadow-sm hover:opacity-95">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
