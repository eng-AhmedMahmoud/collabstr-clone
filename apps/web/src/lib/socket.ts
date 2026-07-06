"use client";

import { io, type Socket } from "socket.io-client";

// A single shared Socket.IO connection for the browser session. The web client
// keeps its access token in an httpOnly cookie it can't read from JS, so we ask
// the same-origin `/api/v1/auth/ws-token` endpoint (the cookie flows through the
// Next rewrite) for the raw token and hand it to the gateway via handshake auth.
// The gateway lives on the API origin (NEXT_PUBLIC_API_URL); the polling
// transport reaches it through the portless proxy even when the ws upgrade is
// blocked, so we list polling first.

let socket: Socket | null = null;

async function fetchWsToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/v1/auth/ws-token", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string | null };
    return data?.token ?? null;
  } catch {
    return null;
  }
}

// Get (or lazily create) the singleton socket. Reconnect-safe: repeated calls
// return the same instance, refreshing the auth token on a stale one rather than
// opening a second connection. Returns null when there's no API origin to reach
// or no token — callers should fall back to the HTTP path in that case.
export async function getSocket(): Promise<Socket | null> {
  if (socket && socket.connected) return socket;

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;

  const token = await fetchWsToken();
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(base, {
    auth: { token },
    withCredentials: true,
    transports: ["polling", "websocket"],
  });
  return socket;
}

// The current socket without creating one (may be null / disconnected).
export function getExistingSocket(): Socket | null {
  return socket;
}

// Tear down the shared socket: drop all listeners, disconnect, and clear the
// singleton so the next getSocket() starts fresh.
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
