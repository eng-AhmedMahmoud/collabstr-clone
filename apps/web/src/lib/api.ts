import { cookies } from "next/headers";

const BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchOpts = RequestInit & { cookieHeader?: string; auth?: boolean; locale?: string };

async function call<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  if (opts.cookieHeader) headers.set("cookie", opts.cookieHeader);
  if (opts.locale) headers.set("accept-language", opts.locale);

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers,
    cache: opts.cache ?? "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    let detail: unknown = text;
    try { detail = JSON.parse(text); } catch {}
    const err: Error & { status?: number; detail?: unknown } = new Error(`API ${res.status} ${path}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, opts: FetchOpts = {}) => call<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts: FetchOpts = {}) =>
    call<T>(path, { ...opts, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, opts: FetchOpts = {}) =>
    call<T>(path, { ...opts, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, opts: FetchOpts = {}) => call<T>(path, { ...opts, method: "DELETE" }),
};

// Server-side API helper. Forwards both the user's cookies and their resolved
// locale so the backend can render bilingual responses without a separate
// query parameter. Locale falls back to the cookie value if present.
export async function serverApi() {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const localeCookie = jar.get("locale")?.value;
  const locale = localeCookie === "ar" ? "ar" : "en";
  return {
    get: <T>(path: string) => call<T>(path, { method: "GET", cookieHeader, locale }),
    post: <T>(path: string, body?: unknown) =>
      call<T>(path, { method: "POST", cookieHeader, locale, body: body ? JSON.stringify(body) : undefined }),
  };
}
