const DEV_FALLBACK = "http://localhost:4000";

// Resolve the API origin. In production a silent localhost fallback would make
// every page render an empty shell — fail fast with an actionable message instead.
export function apiBase(): string {
  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (base) return base;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "API_URL is not set. The admin app cannot reach the NestJS API in production — set API_URL (or NEXT_PUBLIC_API_URL) in the environment.",
    );
  }
  return DEV_FALLBACK;
}

// Merge Set-Cookie headers from an API response into an existing Cookie header,
// replacing (not duplicating) cookies with the same name.
export function mergeSetCookies(cookieHeader: string, setCookies: string[]): string {
  const jar = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  for (const sc of setCookies) {
    const [pair] = sc.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
}
