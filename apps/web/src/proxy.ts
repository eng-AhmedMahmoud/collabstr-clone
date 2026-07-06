import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
if (process.env.NODE_ENV === "production" && !API_URL) {
  throw new Error("API_URL must be set in production — session refresh cannot fall back to localhost.");
}
const API_BASE = API_URL || "http://localhost:4000";

const PROTECTED = [
  "/dashboard",
  "/creator-dashboard",
  "/orders",
  "/settings",
  "/notifications",
  "/saved",
  "/messages",
  "/checkout",
  "/campaigns/new",
];

// Routes only brands may open (posting campaigns). This is a UX gate — the API
// independently enforces @Roles("brand") and 403s a creator regardless.
const BRAND_ONLY = ["/campaigns/new"];

const LANGS = new Set(["en", "ar"]);

// Decode the (unverified) role claim from the access-token JWT payload. Used
// only to redirect the wrong role away from a page; never for authorization.
function roleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64));
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const lang = searchParams.get("lang");
  if (lang && LANGS.has(lang)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    res.cookies.set("locale", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isBrandOnly = BRAND_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const access = req.cookies.get("access_token")?.value;
  if (access) {
    if (isBrandOnly) {
      const role = roleFromToken(access);
      if (role && role !== "brand") {
        const url = req.nextUrl.clone();
        url.pathname = "/campaigns";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // Access token expired (or missing) but a refresh token exists: refresh
  // optimistically so the browser gets fresh cookies without being logged out.
  const refresh = req.cookies.get("refresh_token")?.value;
  if (refresh) {
    try {
      const apiRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      });
      if (apiRes.ok) {
        const res = NextResponse.next();
        for (const cookie of apiRes.headers.getSetCookie()) {
          res.headers.append("set-cookie", cookie);
        }
        return res;
      }
    } catch {
      // API unreachable — fall through and treat the user as signed out.
    }
  }

  if (!isProtected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api/|.*\\..*).*)"],
};
