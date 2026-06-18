"use client";

import Image from "next/image";
import { useState } from "react";
import { CREATORS } from "@/lib/data";

const THREADS = CREATORS.slice(0, 5).map((c, i) => ({
  id: c.username,
  creator: c,
  last: [
    "Just sent over the draft, let me know!",
    "Sounds good — I can do that.",
    "When do you need it delivered?",
    "Thanks for the brief 🙌",
    "Final delivery uploaded.",
  ][i],
  unread: i < 2,
  ts: ["2m", "1h", "Yesterday", "Mon", "Last week"][i],
}));

const SEED_MESSAGES = [
  { from: "creator", text: "Hey! Thanks for reaching out, I&apos;d love to work on this." },
  { from: "me", text: "Awesome — can you turn it around by Friday?" },
  { from: "creator", text: "Yes, no problem. Sending over a first draft tomorrow." },
];

export default function MessagesPage() {
  const [active, setActive] = useState(THREADS[0]);
  const [input, setInput] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-12 gap-4 h-[75vh] rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
        <aside className="col-span-4 border-r border-[#e5e7eb] flex flex-col">
          <div className="p-4 border-b border-[#e5e7eb]">
            <input placeholder="Search messages" className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] bg-[#f7f7fb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200" />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {THREADS.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActive(t)}
                  className={`w-full text-left flex items-center gap-3 p-4 border-b border-[#e5e7eb] ${
                    active.id === t.id ? "bg-[#f7f7fb]" : "hover:bg-[#f7f7fb]"
                  }`}
                >
                  <div className="relative h-11 w-11 rounded-full overflow-hidden bg-[#f3f4f6] shrink-0">
                    <Image src={t.creator.avatar} alt={t.creator.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold truncate">{t.creator.name}</p>
                      <p className="text-xs text-[#6b7280] shrink-0">{t.ts}</p>
                    </div>
                    <p className={`text-sm truncate ${t.unread ? "font-semibold text-[#0b0b14]" : "text-[#6b7280]"}`}>{t.last}</p>
                  </div>
                  {t.unread && <span className="h-2 w-2 rounded-full bg-[#7c3aed] shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-8 flex flex-col">
          <header className="flex items-center gap-3 p-4 border-b border-[#e5e7eb]">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#f3f4f6]">
              <Image src={active.creator.avatar} alt={active.creator.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-bold">{active.creator.name}</p>
              <p className="text-xs text-[#6b7280]">{active.creator.headline}</p>
            </div>
            <button className="ml-auto px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f7fb]">View profile</button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#fafafe]">
            <p className="text-center text-xs text-[#6b7280]">Today</p>
            {SEED_MESSAGES.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  m.from === "me" ? "brand-gradient text-white rounded-br-md" : "bg-white border border-[#e5e7eb] rounded-bl-md"
                }`}>
                  <p className="text-sm">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setInput(""); }}
            className="p-4 border-t border-[#e5e7eb] flex items-center gap-2"
          >
            <button type="button" className="h-10 w-10 rounded-lg border border-[#e5e7eb] hover:bg-[#f7f7fb]">📎</button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <button className="px-5 py-2.5 rounded-lg brand-gradient text-white font-semibold">Send</button>
          </form>
        </section>
      </div>
    </div>
  );
}
