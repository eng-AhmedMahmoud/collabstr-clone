"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Me } from "@collabstr/shared-types";

export function UserMenu({ me }: { me: Me }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border border-[#e5e7eb] hover:border-[#0b0b14]"
      >
        <span className="h-7 w-7 rounded-full brand-gradient grid place-items-center text-white text-xs font-bold">
          {initials || "U"}
        </span>
        <span className="text-sm font-semibold hidden sm:inline">{me.name.split(" ")[0]}</span>
        <span className="text-[#6b7280] text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#e5e7eb] bg-white shadow-xl p-1.5 z-50">
          <p className="px-3 py-2 text-xs text-[#6b7280] border-b border-[#e5e7eb] mb-1">
            Signed in as <span className="font-semibold text-[#0b0b14] block truncate">{me.email}</span>
          </p>
          <MenuLink href={dashHref}>Dashboard</MenuLink>
          {me.role === "brand" && (
            <>
              <MenuLink href="/orders">Orders</MenuLink>
              <MenuLink href="/saved">Saved creators</MenuLink>
              <MenuLink href="/campaigns/new">Post a campaign</MenuLink>
            </>
          )}
          {me.role === "creator" && me.creatorUsername && (
            <>
              <MenuLink href={`/${me.creatorUsername}`}>View public profile</MenuLink>
              <MenuLink href="/creator-dashboard/packages">My packages</MenuLink>
              <MenuLink href="/creator-dashboard/orders">My orders</MenuLink>
            </>
          )}
          <MenuLink href="/messages">Inbox</MenuLink>
          <MenuLink href="/notifications">Notifications</MenuLink>
          <MenuLink href="/settings">Settings</MenuLink>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-1 border-t border-[#e5e7eb] pt-2"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#f7f7fb]">
      {children}
    </Link>
  );
}
