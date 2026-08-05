"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import { useT, useLocale } from "@/components/locale-provider";
import { validateMessage, serverErrorMessage } from "@/lib/validation";
import { getSocket, disconnectSocket } from "@/lib/socket";

type Thread = {
  id: string;
  lastMessageAt: string;
  brand: { id: string; name: string; avatarUrl: string | null };
  creator: { id: string; name: string; avatarUrl: string | null };
  messages: { id: string; body: string; createdAt: string; senderId: string }[];
};

type Message = { id: string; body: string; createdAt: string; senderId: string; threadId?: string };
type SendAck = Message & { ok?: boolean; error?: string };

export function MessagesUI({ me, threads }: { me: { id: string; role: "brand" | "creator" | "admin" | "superadmin" }; threads: Thread[] }) {
  const i = useT();
  const locale = useLocale();
  const router = useRouter();
  const [active, setActive] = useState<Thread | null>(threads[0] ?? null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const [search, setSearch] = useState("");

  const counterpartName = (th: Thread) => (me.role === "brand" ? th.creator : th.brand).name;
  const visibleThreads = search.trim()
    ? threads.filter((th) => counterpartName(th).toLowerCase().includes(search.trim().toLowerCase()))
    : threads;

  const socketRef = useRef<Socket | null>(null);
  const activeIdRef = useRef<string | null>(active?.id ?? null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Append a message unless we already have it (the sender receives both the
  // send-ack AND the thread-room broadcast for its own message).
  function appendUnique(m: Message) {
    setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }

  // HTTP initial load of the open thread's messages + mark read.
  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(null);
    setMsgs([]);
    fetch(`/api/v1/threads/${active.id}/messages`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const m = await r.json();
        setMsgs(Array.isArray(m) ? m : []);
      })
      .catch(() => setError(i.messages.loadError))
      .finally(() => setLoading(false));
    fetch(`/api/v1/threads/${active.id}/read`, { method: "POST", credentials: "include" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Connect the realtime socket once on mount and wire the event listeners.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSocket();
      if (!s || cancelled) return;
      socketRef.current = s;

      const onConnect = () => {
        setLive(true);
        const id = activeIdRef.current;
        if (id) s.emit("thread:join", { threadId: id });
      };
      const onDisconnect = () => setLive(false);
      const onNew = (m: Message) => {
        if (m.threadId && m.threadId === activeIdRef.current) {
          appendUnique(m);
          // We're looking at this thread — mark it read straight away.
          s.emit("thread:read", { threadId: m.threadId });
        } else {
          // Message landed in another thread — refresh the list preview + order.
          router.refresh();
        }
      };
      const onThreadUpdated = () => router.refresh();

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on("message:new", onNew);
      s.on("thread:updated", onThreadUpdated);
      if (s.connected) onConnect();

      cleanupRef.current = () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off("message:new", onNew);
        s.off("thread:updated", onThreadUpdated);
      };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      const id = activeIdRef.current;
      // Best-effort leave (the gateway has no leave handler yet — harmless no-op).
      if (id && socketRef.current) socketRef.current.emit("thread:leave", { threadId: id });
      disconnectSocket();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join the newly opened thread's room (and leave the previous one).
  useEffect(() => {
    const prev = activeIdRef.current;
    activeIdRef.current = active?.id ?? null;
    const s = socketRef.current;
    if (s && prev && prev !== active?.id) s.emit("thread:leave", { threadId: prev });
    if (s && active?.id && s.connected) s.emit("thread:join", { threadId: active.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || sending) return;
    const invalid = validateMessage(input, locale);
    if (invalid) { setError(invalid.message); return; }
    setSending(true);
    setError(null);
    const body = input;
    const s = socketRef.current;
    try {
      if (s && s.connected) {
        // Send over the socket; the ack is the persisted message.
        const ack = (await s.timeout(8000).emitWithAck("message:send", { threadId: active.id, body })) as SendAck;
        if (ack && ack.id) {
          appendUnique(ack);
          setInput("");
        } else {
          setError(i.messages.sendError);
        }
      } else {
        // Socket unavailable — fall back to the HTTP POST.
        const res = await fetch(`/api/v1/threads/${active.id}/messages`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          setError(serverErrorMessage(res.status, b, locale));
          return;
        }
        const newMsg = await res.json();
        appendUnique(newMsg);
        setInput("");
      }
    } catch {
      setError(i.messages.sendError);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-12 gap-4 h-[75vh] rounded-2xl border border-border bg-elevated overflow-hidden">
        <aside className="col-span-4 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={i.messages.searchPh}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface"
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {threads.length === 0 && <li className="p-8 text-center text-sm text-muted">{i.messages.none}</li>}
            {threads.length > 0 && visibleThreads.length === 0 && (
              <li className="p-8 text-center text-sm text-muted">{i.messages.none}</li>
            )}
            {visibleThreads.map((t) => {
              const counter = me.role === "brand" ? t.creator : t.brand;
              const last = t.messages[0];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t)}
                    className={`w-full text-start flex items-center gap-3 p-4 border-b border-border ${
                      active?.id === t.id ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    <div className="relative h-11 w-11 rounded-full overflow-hidden bg-surface shrink-0">
                      <Image src={counter.avatarUrl || `https://i.pravatar.cc/300?u=${encodeURIComponent(counter.name)}`} alt={counter.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{counter.name}</p>
                      <p className="text-sm truncate text-muted">{last?.body ?? i.messages.startConv}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="col-span-8 flex flex-col">
          {active ? (
            <>
              <header className="flex items-center gap-3 p-4 border-b border-border">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-surface">
                  <Image src={(me.role === "brand" ? active.creator : active.brand).avatarUrl || `https://i.pravatar.cc/300?u=${encodeURIComponent((me.role === "brand" ? active.creator : active.brand).name)}`} alt="" fill className="object-cover" unoptimized />
                </div>
                <p className="font-bold">{(me.role === "brand" ? active.creator : active.brand).name}</p>
                <span className="ms-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted" aria-live="polite">
                  <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                  {live ? i.messages.live : i.messages.connecting}
                </span>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-surface">
                {loading && <p className="text-center text-xs text-muted">{i.common.loading}</p>}
                {error && <p className="text-center text-xs text-red-600">{error}</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === me.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      m.senderId === me.id ? "brand-gradient text-white rounded-br-md" : "bg-elevated border border-border rounded-bl-md"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${m.senderId === me.id ? "text-white/70" : "text-muted"}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={send} className="p-4 border-t border-border flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
                  placeholder={i.messages.typePh}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-border"
                />
                <button disabled={sending} className="px-5 py-2.5 rounded-lg brand-gradient text-white font-semibold disabled:opacity-60">
                  {sending ? i.common.sending : i.messages.send}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted text-sm">{i.messages.select}</div>
          )}
        </section>
      </div>
    </div>
  );
}
