import { cookies } from "next/headers";

const BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchOpts = RequestInit & { cookieHeader?: string; auth?: boolean };

async function call<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  if (opts.cookieHeader) headers.set("cookie", opts.cookieHeader);

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers,
    cache: opts.cache ?? "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    let detail: unknown;
    try { detail = await res.json(); } catch { detail = await res.text(); }
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

export async function serverApi() {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  return {
    get: <T>(path: string) => call<T>(path, { method: "GET", cookieHeader }),
    post: <T>(path: string, body?: unknown) =>
      call<T>(path, { method: "POST", cookieHeader, body: body ? JSON.stringify(body) : undefined }),
  };
}
