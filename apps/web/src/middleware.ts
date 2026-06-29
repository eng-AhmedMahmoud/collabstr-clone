import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/creator-dashboard",
  "/orders",
  "/cart",
  "/settings",
  "/notifications",
  "/saved",
  "/messages",
  "/checkout",
  "/campaigns/new",
];

const LANGS = new Set(["en", "ar"]);

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const lang = searchParams.get("lang");
  if (lang && LANGS.has(lang)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    res.cookies.set("locale", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const access = req.cookies.get("access_token")?.value;
  if (access) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api/|.*\\..*).*)"],
};
