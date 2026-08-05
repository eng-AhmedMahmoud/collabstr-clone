"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

type User = { id: string; bannedAt?: string | null; role: string };

export function UserRowActions({ user, viewerRole }: { user: User; viewerRole: string }) {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // Only superadmins may promote/demote admins. The API enforces this too
  // (403 for a plain admin) — this gate just avoids showing dead controls.
  const isSuperadmin = viewerRole === "superadmin";

  async function act(path: string, method = "POST") {
    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/users/${user.id}/${path}`, {
        method, credentials: "include",
        // Always JSON (even `{}`) so cross-site "simple request" posts can't mimic this call.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        // Surface a localized message on 403 (super-admin-only endpoints) so a
        // plain admin who somehow triggers it never fails silently.
        const msg = res.status === 403 ? i.users.forbidden : ((await res.json().catch(() => null))?.message ?? "Failed");
        alert(msg);
      }
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="flex justify-end gap-2 text-xs">
      {user.bannedAt ? (
        <button disabled={busy} onClick={() => act("unban")} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.users.unban}</button>
      ) : (
        <button disabled={busy} onClick={() => { if (!confirm(i.users.banConfirm)) return; act("ban"); }} className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10">{i.users.ban}</button>
      )}
      {isSuperadmin && user.role !== "admin" && user.role !== "superadmin" && (
        <button disabled={busy} onClick={() => { if (!confirm(i.users.makeAdminConfirm)) return; act("promote-admin"); }} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.users.makeAdmin}</button>
      )}
      {isSuperadmin && user.role === "admin" && (
        <button disabled={busy} onClick={() => { if (!confirm(i.users.removeAdminConfirm)) return; act("demote-admin"); }} className="px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-300 hover:bg-amber-500/10">{i.users.removeAdmin}</button>
      )}
    </div>
  );
}
