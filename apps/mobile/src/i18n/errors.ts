import { ApiError } from "@/api/client";
import type { Dict } from "./dict";

// The API returns Zod-style validation failures as:
//   { message: "Validation failed", issues: { fieldErrors: { field: string[] } } }
// This pulls the first message per field so a screen can attach it to the
// matching input. Returns null when the error isn't a field-level 400.
export function fieldErrorsFrom(err: unknown): Record<string, string> | null {
  if (!(err instanceof ApiError)) return null;
  const body = err.body as { issues?: { fieldErrors?: Record<string, unknown> } } | null;
  const fe = body?.issues?.fieldErrors;
  if (!fe || typeof fe !== "object") return null;
  const out: Record<string, string> = {};
  for (const key of Object.keys(fe)) {
    const val = fe[key];
    const first = Array.isArray(val) ? val[0] : val;
    if (typeof first === "string" && first) out[key] = first;
  }
  return Object.keys(out).length ? out : null;
}

// Maps an API/network error to a localized, human sentence. `on401`/`on409`
// let a screen override those (e.g. login: 401 → "wrong email or password";
// signup: 409 → "email already registered").
export function apiErrorMessage(
  err: unknown,
  t: Dict,
  opts: { on401?: string; on409?: string } = {},
): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
      case 422:
        return t.errors.fixFields;
      case 401:
        return opts.on401 ?? t.errors.unauthorized;
      case 403:
        return t.errors.forbidden;
      case 404:
        return t.errors.notFound;
      case 409:
        return opts.on409 ?? t.errors.conflict;
      case 429:
        return t.errors.rateLimited;
    }
    if (err.status >= 500) return t.errors.server;
    return t.errors.generic;
  }
  // Not an ApiError → almost always a fetch/connection failure.
  return t.errors.network;
}
