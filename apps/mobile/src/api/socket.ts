import { io, type Socket } from "socket.io-client";
import { API_BASE, tokens } from "./client";

// Single shared socket for the whole app. Mobile talks straight to the API
// origin (the same base the REST client resolves), so the raw websocket
// transport works — no same-origin proxy needed like the web app.
//
// The gateway authenticates from `handshake.auth.token` (raw or "Bearer …").
// We pass `auth` as a callback so the CURRENT access token is read from secure
// store on every (re)connect — reusing the same `tokens` accessor as the REST
// client — instead of freezing whatever token existed at first connect.
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      auth: (cb: (data: { token: string }) => void) => {
        tokens
          .get()
          .then(({ access }) => cb({ token: access ?? "" }))
          .catch(() => cb({ token: "" }));
      },
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
