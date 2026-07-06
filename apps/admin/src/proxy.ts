import { NextResponse, type NextRequest } from "next/server";
import { apiBase, mergeSetCookies } from "@/lib/api-base";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/")) return NextResponse.next();
  const access = req.cookies.get("access_token")?.value;
  if (access) return NextResponse.next();

  // Access token expired (15 min maxAge) but the session may still be alive:
  // refresh it server-side so admins aren't hard-logged-out mid-task.
  const refresh = req.cookies.get("refresh_token")?.value;
  if (refresh) {
    try {
      const res = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "", "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
      });
      if (res.ok) {
        const setCookies = res.headers.getSetCookie();
        // Let this request render with the fresh tokens…
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("cookie", mergeSetCookies(req.headers.get("cookie") ?? "", setCookies));
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        // …and persist them in the browser for the next one.
        for (const sc of setCookies) response.headers.append("set-cookie", sc);
        return response;
      }
    } catch {
      // API unreachable — treat like an expired session below.
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
