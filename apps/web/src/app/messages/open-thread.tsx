"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Fires the mutating open-thread POST once on mount (the server page render
// stays pure), then refreshes so the new thread shows up in the list.
export function OpenThread({ to }: { to: string }) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/v1/threads/open/${encodeURIComponent(to)}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          router.replace("/messages");
          router.refresh();
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  return null;
}
