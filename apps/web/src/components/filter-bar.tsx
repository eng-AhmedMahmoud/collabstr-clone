"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useT } from "./locale-provider";

const KEYS = ["platform", "category", "followers", "price"] as const;
type Key = (typeof KEYS)[number];

// URL/API params each dropdown controls. Canonical enum values live in the
// URL; localized labels only in the UI.
const PARAMS: Record<Key, string[]> = {
  platform: ["platform"],
  category: ["category"],
  followers: ["minFollowers"],
  price: ["minPrice", "maxPrice"],
};

function priceValue(min: string | null, max: string | null): string | null {
  if (!min && !max) return null;
  return `${min ?? ""}-${max ?? ""}`;
}

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

  function currentValue(key: Key): string | null {
    if (key === "price") return priceValue(params.get("minPrice"), params.get("maxPrice"));
    if (key === "followers") return params.get("minFollowers");
    return params.get(key);
  }

  function set(key: Key, value: string) {
    const next = new URLSearchParams(params.toString());
    const selected = currentValue(key) === value;
    PARAMS[key].forEach((p) => next.delete(p));
    if (!selected) {
      if (key === "price") {
        const [min, max] = value.split("-");
        if (min) next.set("minPrice", min);
        if (max) next.set("maxPrice", max);
      } else if (key === "followers") {
        next.set("minFollowers", value);
      } else {
        next.set(key, value);
      }
    }
    next.delete("page");
    push(next);
    setOpen(null);
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    KEYS.forEach((k) => PARAMS[k].forEach((p) => next.delete(p)));
    next.delete("page");
    push(next);
    setOpen(null);
  }

  const hasAny = KEYS.some((k) => currentValue(k));

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-2">
        {KEYS.map((key) => {
          const label = t.filters.labels[key];
          const options: readonly { value: string; label: string }[] = t.filters.options[key];
          const current = currentValue(key);
          const currentLabel = current
            ? options.find((o) => o.value === current)?.label ?? current
            : null;
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
                {currentLabel ?? label}
                <span className="ms-1 opacity-60" aria-hidden>▾</span>
              </button>
              {open === key && (
                <div
                  role="listbox"
                  className="absolute z-30 mt-2 start-0 w-[calc(100vw-2rem)] sm:w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-elevated shadow-xl p-2"
                >
                  {options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={current === o.value}
                      onClick={() => set(key, o.value)}
                      className={`w-full text-start px-3 py-2 rounded-lg text-sm hover:bg-surface ${
                        current === o.value ? "bg-surface font-semibold" : ""
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {hasAny && (
          <button
            type="button"
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
