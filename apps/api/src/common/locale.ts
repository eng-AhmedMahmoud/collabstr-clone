import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

// Resolve the request's locale from (in priority order):
//  1. ?locale=ar query (lets curl + admin tools force a value)
//  2. "locale" cookie (set after login from User.locale)
//  3. Accept-Language header (first supported locale wins)
// Anything else falls back to the default. The Nest controller layer reads
// this via the @ReqLocale() decorator so services don't need Request.
export function resolveLocale(req: Request): Locale {
  const fromQuery = typeof req.query?.locale === "string" ? req.query.locale : null;
  if (fromQuery === "ar" || fromQuery === "en") return fromQuery;

  const fromCookie = (req as any).cookies?.locale;
  if (fromCookie === "ar" || fromCookie === "en") return fromCookie;

  const header = req.headers["accept-language"];
  if (typeof header === "string") {
    const tags = header.split(",").map((t) => t.trim().toLowerCase().split(";")[0]);
    for (const tag of tags) {
      const base = tag.split("-")[0];
      if (base === "ar" || base === "en") return base;
    }
  }
  return DEFAULT_LOCALE;
}

export const ReqLocale = createParamDecorator((_: unknown, ctx: ExecutionContext): Locale => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return resolveLocale(req);
});

// LocalizedString helper — picks the requested locale, falls back to English
// if the row predates the bilingual switch.
export type LocalizedString = { en: string; ar: string } | string | null | undefined;
export function pickLocalized(s: LocalizedString, locale: Locale): string | null {
  if (s == null) return null;
  if (typeof s === "string") return s;
  return s[locale] ?? s.en ?? null;
}
