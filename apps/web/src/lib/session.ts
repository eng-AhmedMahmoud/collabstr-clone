import { cookies } from "next/headers";
import type { Me } from "@collabstr/shared-types";

const BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getSession(): Promise<Me | null> {
  const jar = await cookies();
  const access = jar.get("access_token");
  if (!access) return null;
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch(`${BASE}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Me;
  } catch {
    return null;
  }
}
