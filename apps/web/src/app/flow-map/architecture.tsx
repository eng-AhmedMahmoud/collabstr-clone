export function Architecture() {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 overflow-x-auto">
      <svg viewBox="0 0 1100 460" className="w-full min-w-[900px]">
        <defs>
          <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
          </marker>
        </defs>

        <Box x={40} y={40} w={200} h={100} title="Browser" sub="Next.js client" tag="React 19 · Tailwind v4" color="#0b0b14" />
        <Box x={310} y={40} w={240} h={100} title="Next.js (apps/web)" sub="App Router, RSC + middleware" tag="Vercel · Node 24" color="#7c3aed" />
        <Box x={620} y={40} w={240} h={100} title="NestJS API (apps/api)" sub="HTTP, JWT, Zod, role guards" tag=":4000 · TS · Express" color="#ec4899" />
        <Box x={920} y={40} w={140} h={100} title="PostgreSQL" sub="Prisma ORM" tag=":55432" color="#0ea5e9" />

        <Box x={310} y={210} w={240} h={70} title="Server components" sub="serverApi() forwards cookies" color="#374151" small />
        <Box x={620} y={210} w={240} h={70} title="Prisma Client" sub="generated from schema.prisma" color="#374151" small />

        <Box x={40} y={330} w={200} h={70} title="Shared types" sub="packages/shared-types (Zod)" color="#10b981" small />
        <Box x={310} y={330} w={240} h={70} title="Auth middleware" sub="checks access_token cookie" color="#10b981" small />
        <Box x={620} y={330} w={240} h={70} title="Modules" sub="auth · users · creators · packages · campaigns · applications · orders · messages · reviews · notifications" color="#10b981" small />

        <Edge x1={240} y1={90} x2={310} y2={90} label="HTTPS / cookies" />
        <Edge x1={550} y1={90} x2={620} y2={90} label="rewrite /api/v1/*" />
        <Edge x1={860} y1={90} x2={920} y2={90} label="TCP 5432" />
        <Edge x1={430} y1={140} x2={430} y2={210} label="renders" />
        <Edge x1={740} y1={140} x2={740} y2={210} label="uses" />
        <Edge x1={430} y1={280} x2={430} y2={330} label="" />
        <Edge x1={740} y1={280} x2={740} y2={330} label="" />
      </svg>

      <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
        {[
          ["Browser → Next", "Cookies (access_token, refresh_token) sent on every request."],
          ["Next → Nest", "Rewrite proxies /api/v1/* — keeps cookies same-origin."],
          ["Nest → Postgres", "Prisma generates a fully typed client from schema.prisma."],
          ["Shared types", "Zod schemas reused by both apps so DTOs can't drift."],
          ["Auth", "JWT (15 min) + refresh (30 d) in httpOnly cookies, rotated server-side."],
          ["Deploy split", "Web on Vercel, API on your choice — both stateless beyond Postgres."],
        ].map(([t, d]) => (
          <li key={t} className="rounded-xl bg-[#f7f7fb] p-4">
            <p className="font-bold">{t}</p>
            <p className="text-[#6b7280] mt-1">{d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Box({
  x, y, w, h, title, sub, tag, color, small,
}: { x: number; y: number; w: number; h: number; title: string; sub?: string; tag?: string; color: string; small?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="white" stroke={color} strokeWidth={2} />
      <text x={x + 14} y={y + (small ? 24 : 32)} fontSize={small ? 13 : 16} fontWeight={800} fill="#0b0b14">{title}</text>
      {sub && <text x={x + 14} y={y + (small ? 44 : 56)} fontSize={11} fill="#6b7280">{sub}</text>}
      {tag && <text x={x + 14} y={y + (h - 14)} fontSize={10} fill={color} fontWeight={700}>{tag}</text>}
    </g>
  );
}

function Edge({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth={1.5} markerEnd="url(#arrow)" />
      {label && (
        <text x={midX} y={midY - 6} fontSize={10} fill="#6b7280" textAnchor="middle">{label}</text>
      )}
    </g>
  );
}
