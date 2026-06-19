"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Me } from "@collabstr/shared-types";
import { useT } from "@/components/locale-provider";

export function UserMenu({ me }: { me: Me }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const i = useT();

  async function logout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.refresh();
    router.push("/");
  }

  const initials = me.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const dashHref = me.role === "creator" ? "/creator-dashboard" : "/dashboard";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border border-border hover:border-fg"
      >
        <span className="h-7 w-7 rounded-full brand-gradient grid place-items-center text-white text-xs font-bold">
          {initials || "U"}
        </span>
        <span className="text-sm font-semibold hidden sm:inline">{me.name.split(" ")[0]}</span>
        <span className="text-muted text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-elevated shadow-xl p-1.5 z-50">
          <p className="px-3 py-2 text-xs text-muted border-b border-border mb-1">
            {i.nav.signedInAs} <span className="font-semibold text-fg block truncate">{me.email}</span>
          </p>
          <MenuLink href={dashHref}>{i.nav.dashboard}</MenuLink>
          {me.role === "brand" && (
            <>
              <MenuLink href="/orders">{i.nav.orders}</MenuLink>
              <MenuLink href="/saved">{i.nav.saved}</MenuLink>
              <MenuLink href="/campaigns/new">{i.nav.newCampaign}</MenuLink>
            </>
          )}
          {me.role === "creator" && me.creatorUsername && (
            <>
              <MenuLink href={`/${me.creatorUsername}`}>{i.nav.publicProfile}</MenuLink>
              <MenuLink href="/creator-dashboard/packages">{i.nav.myPackages}</MenuLink>
              <MenuLink href="/creator-dashboard/orders">{i.nav.myOrders}</MenuLink>
            </>
          )}
          <MenuLink href="/messages">{i.nav.inbox}</MenuLink>
          <MenuLink href="/notifications">{i.nav.notifications}</MenuLink>
          <MenuLink href="/settings">{i.nav.settings}</MenuLink>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-1 border-t border-border pt-2"
          >
            {i.nav.logout}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface">
      {children}
    </Link>
  );
}
