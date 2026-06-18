"use client";

import { useState } from "react";

const FILTERS = [
  { label: "Platform", options: ["Instagram", "TikTok", "YouTube", "UGC"] },
  { label: "Category", options: ["Fashion","Beauty","Travel","Fitness","Food","Lifestyle","Tech","Gaming","Music","Family","Comedy","Pets"] },
  { label: "Followers", options: ["1k–10k","10k–100k","100k–1M","1M+"] },
  { label: "Location", options: ["United States","United Kingdom","Canada","Australia","Germany","Japan"] },
  { label: "Price", options: ["Under $100","$100–$500","$500–$1,500","$1,500+"] },
  { label: "Gender", options: ["Female","Male","Non-binary"] },
  { label: "Age", options: ["18–24","25–34","35–44","45+"] },
];

export function FilterBar() {
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <div key={f.label} className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === f.label ? null : f.label)}
              className={`text-sm font-medium px-3.5 py-2 rounded-full border transition ${
                selected[f.label]
                  ? "bg-fg text-white border-fg"
                  : "bg-elevated text-fg/80 border-border hover:border-fg"
              }`}
            >
              {selected[f.label] ?? f.label}
              <span className="ml-1 opacity-60">▾</span>
            </button>
            {open === f.label && (
              <div className="absolute z-30 mt-2 w-56 rounded-xl border border-border bg-elevated shadow-xl p-2">
                {f.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setSelected((s) => ({ ...s, [f.label]: o }));
                      setOpen(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {Object.keys(selected).length > 0 && (
          <button
            onClick={() => setSelected({})}
            className="text-sm font-medium px-3.5 py-2 rounded-full text-brand hover:bg-[#f5f3ff]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
