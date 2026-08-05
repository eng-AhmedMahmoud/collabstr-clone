"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

export function SaveButton({
  creatorId,
  username,
  loggedIn,
  saved: initialSaved = false,
}: {
  creatorId: string;
  username: string;
  loggedIn: boolean;
  /** Whether the logged-in viewer has already saved this creator (server-resolved). */
  saved?: boolean;
}) {
  const router = useRouter();
  const i = useT();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/${username}`)}`}
        className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface"
      >
        {i.profile.saveLabel}
      </Link>
    );
  }

  async function toggle() {
    setPending(true);
    try {
      const res = await fetch(`/api/v1/creators/${creatorId}/save`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { saved: boolean };
      setSaved(data.saved);
      router.refresh();
    } catch {
      // Ignore — button stays in its previous state.
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-60 ${
        saved ? "border-brand text-brand bg-brand-50" : "border-border hover:bg-surface"
      }`}
    >
      {saved ? i.common.saved : i.profile.saveLabel}
    </button>
  );
}

export function ShareButton({ username, name }: { username: string; name: string }) {
  const i = useT();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/${username}` : `/${username}`;
    // Prefer the native share sheet (mobile); if it's unavailable or the user
    // cancels, fall back to copying the link to the clipboard.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {
        // Cancelled or unsupported — fall through to the clipboard copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing more we can do silently.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface"
    >
      {copied ? i.profile.shareCopied : i.profile.shareLabel}
    </button>
  );
}
