"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function DeleteReviewButton({ id }: { id: string }) {
  const i = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm(i.reviews.deleteConfirm)) return;
    setBusy(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/reviews/${id}`, {
        method: "DELETE", credentials: "include",
      });
      router.refresh();
    } finally { setBusy(false); }
  }
  return (
    <button disabled={busy} onClick={del} className="text-xs px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 self-start">
      {i.reviews.delete}
    </button>
  );
}
