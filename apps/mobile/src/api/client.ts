import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { getCurrentLocale } from "@/i18n/context";

// Base URL priority:
//   1. EXPO_PUBLIC_API_URL env (works in dev, EAS, prod builds)
//   2. Expo Go's LAN hostUri (so a phone on the same wifi can hit the mac)
//   3. localhost (last resort — only iOS sim / desktop, dev only)
// Production builds without an env URL fail fast instead of shipping localhost.
function resolveBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest?.debuggerHost;
  const lanHost = typeof hostUri === "string" ? hostUri.split(":")[0] : undefined;
  const isLanHost = !!lanHost && lanHost !== "localhost" && lanHost !== "127.0.0.1";

  if (!__DEV__) {
    if (!env) {
      throw new Error(
        "EXPO_PUBLIC_API_URL is not set in this production build. " +
        "Configure it in the eas.json build profile env (see apps/mobile/README.md) — " +
        "refusing to fall back to localhost.",
      );
    }
    return env;
  }

  if (env) {
    // Dev on a physical device: the env URL often says localhost, which points
    // at the phone itself. Swap in the mac's LAN IP from Expo's hostUri while
    // keeping the env port so phone-on-wifi dev works.
    const m = env.match(/^(https?):\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i);
    if (m && isLanHost) return `${m[1]}://${lanHost}${m[3] ?? ""}${m[4] ?? ""}`;
    return env;
  }

  if (lanHost) return `http://${lanHost}:4000`;
  return "http://localhost:4000";
}

export const API_BASE = resolveBaseUrl();
export const API_PREFIX = "/api/v1";

const ACCESS_KEY = "nakhla.access";
const REFRESH_KEY = "nakhla.refresh";

export const tokens = {
  async get() {
    const [a, r] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
    ]);
    return { access: a, refresh: r };
  },
  async set(access: string, refresh: string) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]);
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};

// Tiny auth-event emitter — the API layer can't reach React context, so the
// AuthProvider subscribes here to reset `me` when the session dies.
type AuthEvent = "logout";
type AuthListener = (event: AuthEvent) => void;
const authListeners = new Set<AuthListener>();

export function onAuthEvent(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => { authListeners.delete(listener); };
}

function emitAuthEvent(event: AuthEvent) {
  for (const listener of authListeners) listener(event);
}

// Clear tokens because the server definitively rejected the session.
async function clearSession() {
  await tokens.clear();
  emitAuthEvent("logout");
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOpts = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // default true — attach access token if we have one
  query?: Record<string, string | number | undefined | null>;
};

function buildQuery(q?: RequestOpts["query"]): string {
  if (!q) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

async function doFetch(path: string, opts: RequestOpts, accessToken: string | null): Promise<Response> {
  const url = `${API_BASE}${API_PREFIX}${path}${buildQuery(opts.query)}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": getCurrentLocale(),
  };
  if (opts.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

let refreshing: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const { refresh } = await tokens.get();
    if (!refresh) return false;
    // Network errors reject here and propagate to the caller — tokens stay put.
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (res.status === 401 || res.status === 403) {
      // Only a definitive rejection kills the session.
      await clearSession();
      return false;
    }
    if (!res.ok) {
      // 5xx / other transient failures: keep tokens, surface the error.
      throw new ApiError(res.status, `Token refresh failed (HTTP ${res.status})`, null);
    }
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken || !data.refreshToken) return false;
    await tokens.set(data.accessToken, data.refreshToken);
    return true;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { access } = await tokens.get();
  let res = await doFetch(path, opts, access);

  if (res.status === 401 && opts.auth !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const { access: fresh } = await tokens.get();
      res = await doFetch(path, opts, fresh);
    }
  }

  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const msg = (body as any)?.message || res.statusText || `HTTP ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(", ") : msg, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
