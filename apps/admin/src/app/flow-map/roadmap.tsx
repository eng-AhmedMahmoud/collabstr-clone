type Item = {
  title: string;
  body: string;
  effort: "S" | "M" | "L";
  impact: "low" | "med" | "high";
  area: "payments" | "auth" | "creator" | "realtime" | "infra" | "growth" | "trust" | "admin";
};

const PHASES: { name: string; tagline: string; items: Item[] }[] = [
  {
    name: "Now",
    tagline: "Unblocks first real user",
    items: [
      { title: "Stripe Connect + webhooks", body: "Real escrow capture, payouts on release, refund on cancel/dispute. Wire webhook to order state transitions.", effort: "L", impact: "high", area: "payments" },
      { title: "Mada + Apple Pay (KSA)", body: "Stripe + HyperPay alternative for local rails. Currency in SAR.", effort: "M", impact: "high", area: "payments" },
      { title: "Email sender (Resend / Postmark)", body: "Forgot-password, verify-email, order-event notifications. AR + EN templates.", effort: "M", impact: "high", area: "trust" },
      { title: "File uploads (Vercel Blob)", body: "Creator avatars, profile covers, delivery files. Replace URL field on Delivery with object URL.", effort: "M", impact: "high", area: "creator" },
      { title: "Notification producers", body: "Hook into auth, orders, messages services to write Notification rows on key events.", effort: "S", impact: "med", area: "creator" },
      { title: "Audit log full coverage", body: "All admin force-actions already log via OrderEvent[ADMIN]. Extend to user bans / promotions / broadcasts.", effort: "S", impact: "med", area: "admin" },
    ],
  },
  {
    name: "Next",
    tagline: "Production-shape platform",
    items: [
      { title: "WebSockets for messages", body: "Replace poll-on-mount with NestJS WsGateway + browser client. Online presence + typing.", effort: "M", impact: "med", area: "realtime" },
      { title: "SSO (Google + Apple)", body: "Passport strategies in Nest, account linking in web + admin.", effort: "M", impact: "high", area: "auth" },
      { title: "2FA for admins", body: "TOTP required for admin role. Recovery codes stored hashed.", effort: "M", impact: "high", area: "admin" },
      { title: "Audience analytics OAuth", body: "Creator connects IG/TikTok/YT, nightly refresh via cron.", effort: "L", impact: "high", area: "creator" },
      { title: "Multi-package cart", body: "Persist cart in DB, batch checkout = one PaymentIntent → multiple orders.", effort: "M", impact: "med", area: "payments" },
      { title: "Admin role granularity", body: "Split admin into ops / finance / moderator with per-route permissions.", effort: "M", impact: "med", area: "admin" },
    ],
  },
  {
    name: "Later",
    tagline: "Scale & growth",
    items: [
      { title: "Search (Typesense / Postgres FTS)", body: "Replace LIKE filters with proper ranking + facets, instant search UI.", effort: "M", impact: "med", area: "growth" },
      { title: "Background jobs (BullMQ)", body: "Email digests, analytics refresh, escrow auto-release timers.", effort: "M", impact: "med", area: "infra" },
      { title: "Observability", body: "Sentry on web + admin + api, structured logs, OpenTelemetry traces.", effort: "S", impact: "med", area: "infra" },
      { title: "Affiliate tracking", body: "Per-creator referral codes + payout splits; UTM tracking.", effort: "M", impact: "med", area: "growth" },
      { title: "Mobile (Expo)", body: "Reuse @collabstr/shared-types from React Native client.", effort: "L", impact: "high", area: "growth" },
    ],
  },
];

const AREA_COLOR: Record<Item["area"], string> = {
  payments: "#a78bfa",
  auth: "#0ea5e9",
  creator: "#ec4899",
  realtime: "#f59e0b",
  infra: "#8b8ba0",
  growth: "#10b981",
  trust: "#ef4444",
  admin: "#fcd34d",
};

const IMPACT_LABEL = { high: "high impact", med: "med impact", low: "low impact" };

export function Roadmap() {
  return (
    // Lock LTR — content is English route paths + technical jargon.
    <div dir="ltr" className="space-y-8">
      {PHASES.map((p) => (
        <section key={p.name}>
          <header className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
            <h3 className="text-xl font-black">{p.name}</h3>
            <p className="text-sm text-muted">{p.tagline}</p>
          </header>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
            {p.items.map((it) => (
              <article key={it.title} className="card p-5 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${AREA_COLOR[it.area]}22`, color: AREA_COLOR[it.area] }}>{it.area}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-surface-2 text-fg/85">effort {it.effort}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-surface-2 text-fg/85">{IMPACT_LABEL[it.impact]}</span>
                </div>
                <h4 className="font-bold text-[#f5f5f7] break-words">{it.title}</h4>
                <p className="text-sm text-muted mt-1.5 leading-snug break-words">{it.body}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
