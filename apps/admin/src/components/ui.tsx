import Link from "next/link";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between flex-wrap gap-y-3 gap-x-4 mb-5 sm:mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-black truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-muted mt-1 truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function StatGrid({ stats }: { stats: { label: string; value: string; sub?: string; tone?: "success" | "danger" | "warn" }[] }) {
  const tone = { success: "#34d399", danger: "#f87171", warn: "#fbbf24" } as const;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card p-3 sm:p-4 hover:card-glow hover:-translate-y-0.5 transition-all duration-200 min-w-0"
        >
          <p className="text-[10px] uppercase tracking-wider text-muted truncate">{s.label}</p>
          <p
            className={`text-lg sm:text-2xl font-black mt-1 truncate ${!s.tone ? "brand-text" : ""}`}
            style={s.tone ? { color: tone[s.tone] } : undefined}
          >
            {s.value}
          </p>
          {s.sub && <p className="text-[11px] sm:text-xs text-muted mt-1 truncate">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

export function Card({ title, action, children, padding = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; padding?: boolean }) {
  return (
    <section className="card min-w-0 overflow-hidden">
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
          <h2 className="font-bold text-sm sm:text-base truncate min-w-0">{title}</h2>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padding ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}

export function Pill({ kind, children }: { kind: "ok" | "warn" | "bad" | "muted" | "brand"; children: React.ReactNode }) {
  const map = {
    ok:    "bg-emerald-500/15 text-emerald-300",
    warn:  "bg-amber-500/15 text-amber-300",
    bad:   "bg-red-500/15 text-red-300",
    muted: "bg-surface-2 text-muted",
    brand: "bg-emerald-500/15 text-emerald-300",
  }[kind];
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${map}`}>{children}</span>;
}

export function EmptyState({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div className="text-center py-16">
      <p className="text-3xl">∅</p>
      <h3 className="text-lg font-bold mt-3">{title}</h3>
      <p className="text-muted text-sm mt-1">{body}</p>
      {cta && <Link href={cta.href} className="mt-5 inline-flex px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold">{cta.label}</Link>}
    </div>
  );
}

export function pillKindForStatus(status: string): "ok" | "warn" | "bad" | "brand" | "muted" {
  if (status === "released" || status === "approved" || status === "accepted") return "ok";
  if (status === "submitted" || status === "revision_requested" || status === "pending") return "warn";
  if (status === "cancelled" || status === "disputed" || status === "rejected") return "bad";
  if (status === "in_progress" || status === "awaiting_creator" || status === "open") return "brand";
  return "muted";
}
