import { cookies } from "next/headers";
import type { Me } from "@collabstr/shared-types";
import { apiBase, mergeSetCookies } from "./api-base";

export async function getAdminSession(): Promise<Me | null> {
  const jar = await cookies();
  const hasRefresh = !!jar.get("refresh_token");
  if (!jar.get("access_token") && !hasRefresh) return null;
  let cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    let res = await fetch(`${apiBase()}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.status === 401 && hasRefresh) {
      // Access token expired mid-session: attempt one refresh, then retry.
      // (The proxy persists rotated cookies in the browser; here we only need
      // the fresh access token for this render.)
      const refreshed = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { cookie: cookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
      });
      if (!refreshed.ok) return null;
      cookieHeader = mergeSetCookies(cookieHeader, refreshed.headers.getSetCookie());
      res = await fetch(`${apiBase()}/api/v1/auth/me`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
    }
    if (!res.ok) return null;
    const me = (await res.json()) as Me;
    // Both admins and superadmins may use the console. Superadmins additionally
    // gain the promote/demote controls, gated in the UI by me.role.
    if (me.role !== "admin" && me.role !== "superadmin") return null;
    return me;
  } catch {
    return null;
  }
}
