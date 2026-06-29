type Flow = { from: string; to: string };
type RoleBlock = { role: "Logged-out" | "Brand" | "Creator" | "Admin"; color: string; emoji: string; steps: Flow[] };

const FLOWS: RoleBlock[] = [
  {
    role: "Logged-out",
    color: "#8b8ba0",
    emoji: "👀",
    steps: [
      { from: "Land on /", to: "Browse /influencers" },
      { from: "Browse /influencers", to: "Open profile /[username]" },
      { from: "Open profile", to: "Add to cart → /login (gated)" },
      { from: "/signup", to: "Pick role → onboarded" },
      { from: "Read /pricing /for-creators /about /help", to: "Convert to signup" },
    ],
  },
  {
    role: "Brand",
    color: "#a78bfa",
    emoji: "🏢",
    steps: [
      { from: "Login", to: "/dashboard (KPIs + orders + campaigns)" },
      { from: "/influencers", to: "Save creators → /saved" },
      { from: "Profile → Add to cart", to: "/checkout (brief + payment)" },
      { from: "/orders/[id]", to: "Approve / request revision / release escrow" },
      { from: "/campaigns/new", to: "4-step wizard → /campaigns/[id]" },
      { from: "/campaigns/[id]", to: "Review applicants → accept/reject" },
      { from: "/messages", to: "Thread per creator (poll)" },
      { from: "/settings", to: "Account · Security · Notifications · Billing" },
    ],
  },
  {
    role: "Creator",
    color: "#ec4899",
    emoji: "🎬",
    steps: [
      { from: "Login", to: "/creator-dashboard (queue + applications + earnings)" },
      { from: "/creator-dashboard/packages", to: "CRUD packages → updates public profile" },
      { from: "/creator-dashboard/orders", to: "Grouped by status" },
      { from: "/orders/[id]", to: "Accept → submit delivery URL → revise" },
      { from: "/campaigns", to: "Apply with price + pitch" },
      { from: "/messages", to: "Reply to brand briefs" },
      { from: "Reviews accumulate", to: "Rating + reviewsCount recomputed on release" },
    ],
  },
  {
    role: "Admin",
    color: "#f59e0b",
    emoji: "🛡",
    steps: [
      { from: "/login → /", to: "Overview KPIs, recent activity" },
      { from: "/users", to: "Search, ban / unban, promote to admin" },
      { from: "/orders", to: "Force release · force cancel · mark disputed" },
      { from: "/disputes", to: "Triage open disputes" },
      { from: "/payouts", to: "Per-creator released totals" },
      { from: "/reviews", to: "Moderate / delete" },
      { from: "/broadcast", to: "Send system notifications to roles" },
      { from: "/audit", to: "Admin-only event trail" },
    ],
  },
];

export function RoleFlows() {
  return (
    // Lock LTR — these are technical user-journey labels with English route paths.
    <div dir="ltr" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {FLOWS.map((f) => (
        <article key={f.role} className="card p-5 min-w-0">
          <header className="flex items-center gap-3">
            <span className="h-10 w-10 grid place-items-center rounded-xl text-xl shrink-0" style={{ background: `${f.color}22`, color: f.color }}>{f.emoji}</span>
            <div className="min-w-0">
              <h3 className="font-black text-lg truncate">{f.role}</h3>
              <p className="text-xs text-muted">{f.steps.length} key journeys</p>
            </div>
          </header>
          <ol className="mt-4 space-y-3">
            {f.steps.map((s, i) => (
              <li key={i} className="flex gap-3 min-w-0">
                <span className="h-6 w-6 rounded-full text-xs font-bold grid place-items-center shrink-0" style={{ background: `${f.color}22`, color: f.color }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug text-[#f5f5f7] break-words">{s.from}</p>
                  <p className="text-xs text-muted mt-0.5 leading-snug break-words" style={{ wordBreak: "break-word" }}>
                    <span className="text-fg/40">→ </span>{s.to}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}
