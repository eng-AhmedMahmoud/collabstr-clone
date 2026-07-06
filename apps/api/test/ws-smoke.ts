/**
 * WebSocket chat smoke test.
 *
 * Run against a RUNNING local API (the dev server is under portless with a
 * dynamic port, so pass the real base URL via WS_TEST_URL):
 *
 *   WS_TEST_URL=https://collabstr-api.localhost \
 *     node --env-file=.env --import=tsx test/ws-smoke.ts
 *
 * Flow: log in a brand + a creator over HTTP, open a thread between them,
 * connect two authenticated socket.io clients, have both join the thread, then
 * the creator sends a message and we assert the brand receives `message:new`
 * with the same body within 5s.
 */
import { io, type Socket } from "socket.io-client";

const BASE = (process.env.WS_TEST_URL ?? "http://localhost:4000").replace(/\/$/, "");
const API = `${BASE}/api/v1`;
const BODY = "ws test hello";
const TIMEOUT_MS = 5000;

const BRAND = { email: "brand@example.dev", password: "Password123!" };
const CREATOR = { email: "barmz@example.dev", password: "Password123!" };
const CREATOR_USERNAME = "barmz.alhajjaj";

function log(...args: unknown[]) {
  console.log("[ws-smoke]", ...args);
}

function fail(reason: string): never {
  console.log(`WS TEST FAIL: ${reason}`);
  process.exit(1);
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email} -> HTTP ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { accessToken?: string };
  if (!json.accessToken) throw new Error(`login ${email} returned no accessToken`);
  return json.accessToken;
}

async function openThread(brandToken: string, username: string): Promise<string> {
  const res = await fetch(`${API}/threads/open/${encodeURIComponent(username)}`, {
    method: "POST",
    headers: { authorization: `Bearer ${brandToken}` },
  });
  if (!res.ok) throw new Error(`open thread -> HTTP ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("open thread returned no id");
  return json.id;
}

function connect(token: string, label: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: false,
      timeout: TIMEOUT_MS,
    });
    const t = setTimeout(() => reject(new Error(`${label} socket connect timeout`)), TIMEOUT_MS);
    socket.on("connect", () => {
      clearTimeout(t);
      log(`${label} connected (${socket.id})`);
      resolve(socket);
    });
    socket.on("connect_error", (err) => {
      clearTimeout(t);
      reject(new Error(`${label} connect_error: ${err.message}`));
    });
    socket.on("disconnect", (reason) => log(`${label} disconnected: ${reason}`));
  });
}

async function join(socket: Socket, threadId: string, label: string): Promise<void> {
  const ack = (await socket
    .timeout(TIMEOUT_MS)
    .emitWithAck("thread:join", { threadId })
    .catch((e: unknown) => {
      throw new Error(`${label} thread:join failed: ${String(e)}`);
    })) as { ok?: boolean };
  if (!ack?.ok) throw new Error(`${label} thread:join was rejected (not a participant?)`);
  log(`${label} joined thread ${threadId}`);
}

async function main() {
  log(`base=${BASE}`);

  const [brandToken, creatorToken] = await Promise.all([
    login(BRAND.email, BRAND.password),
    login(CREATOR.email, CREATOR.password),
  ]);
  log("logged in brand + creator");

  const threadId = await openThread(brandToken, CREATOR_USERNAME);
  log(`thread id: ${threadId}`);

  const [brandSocket, creatorSocket] = await Promise.all([
    connect(brandToken, "brand"),
    connect(creatorToken, "creator"),
  ]);

  // Arm the assertion BEFORE anyone sends, so we never miss the event.
  const received = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`brand did not receive message:new within ${TIMEOUT_MS}ms`)),
      TIMEOUT_MS,
    );
    brandSocket.on("message:new", (msg: { body?: string }) => {
      if (msg?.body === BODY) {
        clearTimeout(timer);
        resolve();
      }
    });
  });

  await Promise.all([join(brandSocket, threadId, "brand"), join(creatorSocket, threadId, "creator")]);

  log("creator sending message…");
  creatorSocket.emit("message:send", { threadId, body: BODY });

  await received;

  brandSocket.close();
  creatorSocket.close();
  console.log("WS TEST PASS");
  process.exit(0);
}

main().catch((e: unknown) => fail(e instanceof Error ? e.message : String(e)));
