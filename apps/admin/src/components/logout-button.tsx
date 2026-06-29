"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.refresh();
    router.push("/login");
  }
  return (
    <button onClick={logout} title="Log out" className="text-muted hover:text-white text-sm">
      ↩
    </button>
  );
}
