"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

type User = { id: string; bannedAt?: string | null; role: string };

export function UserRowActions({ user }: { user: User }) {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(path: string, method = "POST") {
    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/users/${user.id}/${path}`, {
        method, credentials: "include",
      });
      if (!res.ok) alert((await res.json())?.message ?? "Failed");
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="flex justify-end gap-2 text-xs">
      {user.bannedAt ? (
        <button disabled={busy} onClick={() => act("unban")} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.users.unban}</button>
      ) : (
        <button disabled={busy} onClick={() => act("ban")} className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10">{i.users.ban}</button>
      )}
      {user.role !== "admin" && (
        <button disabled={busy} onClick={() => act("promote-admin")} className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">{i.users.makeAdmin}</button>
      )}
    </div>
  );
}
