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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
