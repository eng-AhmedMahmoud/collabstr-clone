"use client";

import { useState } from "react";

const FILTERS = [
  { label: "Platform", options: ["Instagram", "TikTok", "Snapchat", "YouTube", "UGC"] },
  { label: "Category", options: ["Fashion","Beauty","Travel","Fitness","Food","Lifestyle","Tech","Gaming","Music","Family","Comedy","Pets"] },
  { label: "Followers", options: ["1k–10k","10k–100k","100k–1M","1M+"] },
  {
    label: "City · المدينة",
    options: [
      "Riyadh · الرياض",
      "Jeddah · جدة",
      "Dammam · الدمام",
      "Khobar · الخبر",
      "Mecca · مكة المكرمة",
      "Medina · المدينة المنورة",
      "Taif · الطائف",
      "Tabuk · تبوك",
      "Abha · أبها",
      "Buraidah · بريدة",
      "NEOM · نيوم",
      "AlUla · العُلا",
    ],
  },
  {
    label: "Price · السعر",
    options: [
      "Under 500 ر.س",
      "500–2,000 ر.س",
      "2,000–10,000 ر.س",
      "10,000+ ر.س",
    ],
  },
  { label: "Gender · الجنس", options: ["Female · أنثى","Male · ذكر"] },
  { label: "Age · العمر", options: ["18–24","25–34","35–44","45+"] },
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
              <div className="absolute z-30 mt-2 w-64 rounded-xl border border-border bg-elevated shadow-xl p-2">
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
            className="text-sm font-medium px-3.5 py-2 rounded-full text-brand hover:bg-brand-50"
          >
            Clear all · مسح
          </button>
        )}
      </div>
    </div>
  );
}
