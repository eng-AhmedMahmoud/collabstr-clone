"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useT } from "./locale-provider";

const KEYS = ["platform", "category", "followers", "city", "price", "gender", "age"] as const;
type Key = (typeof KEYS)[number];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useT();
  const [open, setOpen] = useState<Key | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(null); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function push(next: URLSearchParams) {
    const target = pathname === "/" ? "/influencers" : pathname;
    const q = next.toString();
    router.push(q ? `${target}?${q}` : target);
  }

  function set(key: Key, value: string) {
    const next = new URLSearchParams(params.toString());
    if (params.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    push(next);
    setOpen(null);
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    KEYS.forEach((k) => next.delete(k));
    push(next);
    setOpen(null);
  }

  const hasAny = KEYS.some((k) => params.get(k));

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-2">
        {KEYS.map((key) => {
          const label = t.filters.labels[key];
          const options = t.filters.options[key];
          const current = params.get(key);
          return (
            <div key={key} className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === key ? null : key)}
                aria-haspopup="listbox"
                aria-expanded={open === key}
                className={`text-sm font-medium px-3.5 py-2 rounded-full border transition ${
                  current
                    ? "bg-fg text-bg border-fg"
                    : "bg-elevated text-fg/80 border-border hover:border-fg"
                }`}
              >
                {current ?? label}
                <span className="ms-1 opacity-60" aria-hidden>▾</span>
              </button>
              {open === key && (
                <div
                  role="listbox"
                  className="absolute z-30 mt-2 start-0 w-[calc(100vw-2rem)] sm:w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-elevated shadow-xl p-2"
                >
                  {options.map((o) => (
                    <button
                      key={o}
                      role="option"
                      aria-selected={current === o}
                      onClick={() => set(key, o)}
                      className={`w-full text-start px-3 py-2 rounded-lg text-sm hover:bg-surface ${
                        current === o ? "bg-surface font-semibold" : ""
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {hasAny && (
          <button
            onClick={clearAll}
            className="text-sm font-medium px-3.5 py-2 rounded-full text-brand hover:bg-brand-50"
          >
            {t.filters.clearAll}
          </button>
        )}
      </div>
    </div>
  );
}
