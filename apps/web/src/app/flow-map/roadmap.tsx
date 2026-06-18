type Item = {
  title: string;
  body: string;
  effort: "S" | "M" | "L";
  impact: "low" | "med" | "high";
  area: "payments" | "auth" | "creator" | "realtime" | "infra" | "growth" | "trust";
};

const PHASES: { name: string; tagline: string; items: Item[] }[] = [
  {
    name: "Now",
    tagline: "Unblocks first real user",
    items: [
      { title: "Stripe Connect + webhooks", body: "Real escrow capture, payouts to creators on release, refund on cancel/dispute. Wire to /api/v1/orders/* webhook → state transitions.", effort: "L", impact: "high", area: "payments" },
      { title: "Email sender (Resend / Postmark)", body: "Forgot-password, verify-email, order-event notifications. Templates + queue.", effort: "M", impact: "high", area: "trust" },
      { title: "File uploads (Vercel Blob)", body: "Creator avatars, profile covers, delivery files. Replace URL field on Delivery with object URL.", effort: "M", impact: "high", area: "creator" },
      { title: "Notification producers", body: "Hook into auth.service, orders.service, messages.service to write Notification rows on key events.", effort: "S", impact: "med", area: "creator" },
    ],
  },
  {
    name: "Next",
    tagline: "Production-shape platform",
    items: [
      { title: "WebSockets for messages", body: "Replace poll-on-mount with NestJS WsGateway + browser client. Online presence + typing.", effort: "M", impact: "med", area: "realtime" },
      { title: "SSO (Google + Apple)", body: "Passport strategies in Nest, plus matching providers on web. Account linking.", effort: "M", impact: "high", area: "auth" },
      { title: "2FA (TOTP)", body: "Settings → Security enables it. Recovery codes stored hashed.", effort: "M", impact: "med", area: "auth" },
      { title: "Audience-analytics OAuth", body: "Connect IG/TikTok/YouTube on the creator side, refresh stats nightly via cron.", effort: "L", impact: "high", area: "creator" },
      { title: "Multi-package cart", body: "Persist cart in DB, batch checkout = one Stripe PaymentIntent → multiple orders.", effort: "M", impact: "med", area: "payments" },
    ],
  },
  {
    name: "Later",
    tagline: "Scale & growth",
    items: [
      { title: "Search (Typesense or Postgres FTS)", body: "Replace LIKE filters with proper ranking + facets, instant search UI.", effort: "M", impact: "med", area: "growth" },
      { title: "Admin console", body: "Disputes queue, content moderation, refunds, user impersonation.", effort: "L", impact: "med", area: "trust" },
      { title: "Affiliate tracking", body: "Per-creator referral codes + payout splits; UTM and on-site tracking.", effort: "M", impact: "med", area: "growth" },
      { title: "Background jobs (BullMQ)", body: "Email digests, analytics refresh, escrow auto-release timers.", effort: "M", impact: "med", area: "infra" },
      { title: "Observability", body: "Sentry on web + api, structured logs, OpenTelemetry traces through Nest.", effort: "S", impact: "med", area: "infra" },
      { title: "Mobile (Expo)", body: "Reuse @collabstr/shared-types from React Native client.", effort: "L", impact: "high", area: "growth" },
    ],
  },
];

const AREA_COLOR: Record<Item["area"], string> = {
  payments: "#7c3aed",
  auth: "#0ea5e9",
  creator: "#ec4899",
  realtime: "#f59e0b",
  infra: "#6b7280",
  growth: "#10b981",
  trust: "#ef4444",
};

const IMPACT_LABEL = { high: "high impact", med: "med impact", low: "low impact" };

export function Roadmap() {
  return (
    <div className="space-y-8">
      {PHASES.map((p) => (
        <section key={p.name}>
          <header className="flex items-baseline gap-3">
            <h3 className="text-xl font-black">{p.name}</h3>
            <p className="text-sm text-[#6b7280]">{p.tagline}</p>
          </header>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {p.items.map((it) => (
              <article key={it.title} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${AREA_COLOR[it.area]}15`, color: AREA_COLOR[it.area] }}>
                    {it.area}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f7f7fb] text-[#374151]">
                    effort {it.effort}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f7f7fb] text-[#374151]">
                    {IMPACT_LABEL[it.impact]}
                  </span>
                </div>
                <h4 className="font-bold">{it.title}</h4>
                <p className="text-sm text-[#6b7280] mt-1.5">{it.body}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
