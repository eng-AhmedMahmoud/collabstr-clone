import { cookies } from "next/headers";
import type { Me } from "@collabstr/shared-types";

const ENV_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
if (process.env.NODE_ENV === "production" && !ENV_BASE) {
  throw new Error("API_URL must be set in production — refusing to fall back to localhost.");
}
const BASE = ENV_BASE || "http://localhost:4000";

async function fetchMe(cookieHeader: string): Promise<Response> {
  return fetch(`${BASE}/api/v1/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
}

export async function getSession(): Promise<Me | null> {
  const jar = await cookies();
  const access = jar.get("access_token");
  const refresh = jar.get("refresh_token");
  if (!access && !refresh) return null;
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    if (access) {
      const res = await fetchMe(cookieHeader);
      if (res.ok) return (await res.json()) as Me;
      if (res.status !== 401 || !refresh) return null;
    }
    // Access token missing/expired but a refresh token exists: refresh once
    // and retry with the fresh cookies. (The proxy persists new cookies to the
    // browser; here we only need them for this render.)
    const refreshRes = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!refreshRes.ok) return null;
    const pairs = new Map(jar.getAll().map((c) => [c.name, c.value] as const));
    for (const sc of refreshRes.headers.getSetCookie()) {
      const [pair] = sc.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) pairs.set(pair.slice(0, eq).trim(), pair.slice(eq + 1));
    }
    const freshHeader = [...pairs].map(([k, v]) => `${k}=${v}`).join("; ");
    const retry = await fetchMe(freshHeader);
    if (!retry.ok) return null;
    return (await retry.json()) as Me;
  } catch {
    return null;
  }
}
