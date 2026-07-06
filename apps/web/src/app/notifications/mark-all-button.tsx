"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

export function MarkAllButton() {
  const router = useRouter();
  const i = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function markAll() {
    setPending(true);
    setError(false);
    try {
      const res = await fetch("/api/v1/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="text-end">
      <button type="button" onClick={markAll} disabled={pending} className="text-sm font-semibold text-brand disabled:opacity-60">
        {i.notifications.markAll}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{i.notifications.markAllError}</p>}
    </div>
  );
}
