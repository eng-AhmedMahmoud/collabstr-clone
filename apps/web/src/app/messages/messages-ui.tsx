"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Thread = {
  id: string;
  lastMessageAt: string;
  brand: { id: string; name: string; avatarUrl: string | null };
  creator: { id: string; name: string; avatarUrl: string | null };
  messages: { id: string; body: string; createdAt: string; senderId: string }[];
};

type Message = { id: string; body: string; createdAt: string; senderId: string };

export function MessagesUI({ me, threads }: { me: { id: string; role: "brand" | "creator" | "admin" }; threads: Thread[] }) {
  const [active, setActive] = useState<Thread | null>(threads[0] ?? null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/threads/${active.id}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((m) => setMsgs(m))
      .finally(() => setLoading(false));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/threads/${active.id}/read`, { method: "POST", credentials: "include" });
  }, [active?.id]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !input.trim()) return;
    const body = input;
    setInput("");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/threads/${active.id}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const newMsg = await res.json();
      setMsgs((m) => [...m, newMsg]);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-12 gap-4 h-[75vh] rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
        <aside className="col-span-4 border-r border-[#e5e7eb] flex flex-col">
          <div className="p-4 border-b border-[#e5e7eb]">
            <input placeholder="Search messages" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] bg-[#f7f7fb]" />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {threads.length === 0 && <li className="p-8 text-center text-sm text-[#6b7280]">No conversations yet.</li>}
            {threads.map((t) => {
              const counter = me.role === "brand" ? t.creator : t.brand;
              const last = t.messages[0];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t)}
                    className={`w-full text-left flex items-center gap-3 p-4 border-b border-[#e5e7eb] ${
                      active?.id === t.id ? "bg-[#f7f7fb]" : "hover:bg-[#f7f7fb]"
                    }`}
                  >
                    <div className="relative h-11 w-11 rounded-full overflow-hidden bg-[#f3f4f6] shrink-0">
                      <Image src={counter.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(counter.name)}`} alt={counter.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{counter.name}</p>
                      <p className="text-sm truncate text-[#6b7280]">{last?.body ?? "Start the conversation"}</p>
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
              <header className="flex items-center gap-3 p-4 border-b border-[#e5e7eb]">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#f3f4f6]">
                  <Image src={(me.role === "brand" ? active.creator : active.brand).avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent((me.role === "brand" ? active.creator : active.brand).name)}`} alt="" fill className="object-cover" />
                </div>
                <p className="font-bold">{(me.role === "brand" ? active.creator : active.brand).name}</p>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#fafafe]">
                {loading && <p className="text-center text-xs text-[#6b7280]">Loading…</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === me.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      m.senderId === me.id ? "brand-gradient text-white rounded-br-md" : "bg-white border border-[#e5e7eb] rounded-bl-md"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${m.senderId === me.id ? "text-white/70" : "text-[#6b7280]"}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={send} className="p-4 border-t border-[#e5e7eb] flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#e5e7eb]"
                />
                <button className="px-5 py-2.5 rounded-lg brand-gradient text-white font-semibold">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-[#6b7280] text-sm">Select a conversation</div>
          )}
        </section>
      </div>
    </div>
  );
}
