type Flow = { from: string; to: string };

const FLOWS: { role: "Logged-out"; color: string; emoji: string; steps: Flow[] }[] | { role: "Brand"; color: string; emoji: string; steps: Flow[] }[] | { role: "Creator"; color: string; emoji: string; steps: Flow[] }[] = [
  {
    role: "Logged-out",
    color: "#6b7280",
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
    color: "#7c3aed",
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
];

export function RoleFlows() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {FLOWS.map((f) => (
        <article key={f.role} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <header className="flex items-center gap-3">
            <span className="h-10 w-10 grid place-items-center rounded-xl text-xl" style={{ background: `${f.color}15`, color: f.color }}>
              {f.emoji}
            </span>
            <div>
              <h3 className="font-black text-lg">{f.role}</h3>
              <p className="text-xs text-[#6b7280]">{f.steps.length} key journeys</p>
            </div>
          </header>
          <ol className="mt-4 space-y-3">
            {f.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-6 w-6 rounded-full text-xs font-bold grid place-items-center shrink-0" style={{ background: `${f.color}15`, color: f.color }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{s.from}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">↳ {s.to}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}
