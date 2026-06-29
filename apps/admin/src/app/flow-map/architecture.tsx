export function Architecture() {
  return (
    // dir="ltr" — pure technical topology diagram.
    <div dir="ltr" className="card p-4 sm:p-6 overflow-x-auto">
      <svg viewBox="0 0 1320 500" className="w-full min-w-[960px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow-arch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b8ba0" />
          </marker>
        </defs>

        <Box x={20}  y={40}  w={190} h={110} title="Browser" sub="Public marketplace" tag="React 19" color="#d1d1da" />
        <Box x={20}  y={200} w={190} h={110} title="Browser" sub="Admin console" tag="this app" color="#ec4899" />

        <Box x={280} y={40}  w={240} h={110} title="apps/web (Nakhla)" sub="Next.js · /api/v1 rewrite" tag="collabstr-web.localhost" color="#7c3aed" />
        <Box x={280} y={200} w={240} h={110} title="apps/admin" sub="Next.js · admin-only" tag="collabstr-admin.localhost" color="#ec4899" />

        <Box x={600} y={120} w={300} h={110} title="apps/api (NestJS)" sub="JWT cookies · Zod · role guards" tag="collabstr-api.localhost" color="#a78bfa" />

        <Box x={980} y={120} w={170} h={110} title="PostgreSQL" sub="Prisma ORM" tag="port 55432" color="#0ea5e9" />

        <Box x={280} y={360} w={620} h={90} title="API modules" sub="auth · users · creators · packages · campaigns · applications · orders · messages · reviews · notifications · admin" color="#10b981" small />
        <Box x={20}  y={360} w={240} h={90} title="@collabstr/shared-types" sub="Zod schemas reused web ↔ admin ↔ api" color="#f59e0b" small />

        <Edge x1={210} y1={95}  x2={280} y2={95}  label="HTTPS" />
        <Edge x1={210} y1={255} x2={280} y2={255} label="HTTPS" />
        <Edge x1={520} y1={95}  x2={600} y2={150} label="rewrite /api/v1" />
        <Edge x1={520} y1={255} x2={600} y2={200} label="rewrite /api/v1" />
        <Edge x1={900} y1={175} x2={980} y2={175} label="TCP 5432" />
        <Edge x1={750} y1={230} x2={590} y2={360} />
      </svg>

      <p className="text-xs text-muted mt-4">
        Three Next.js processes (web · admin) + one NestJS (api) + Postgres, glued by a single Zod-typed contract package. Same shape mirrors in the Diwaniya fork (<code className="bg-bg px-1.5 py-0.5 rounded">@diwaniya/*</code>).
      </p>
    </div>
  );
}

function Box({ x, y, w, h, title, sub, tag, color, small }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tag?: string; color: string; small?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#11111c" stroke={color} strokeWidth={2} />
      <text x={x + 16} y={y + (small ? 26 : 34)} fontSize={small ? 14 : 17} fontWeight={800} fill="#f5f5f7">{title}</text>
      {sub && <text x={x + 16} y={y + (small ? 48 : 60)} fontSize={11} fill="#8b8ba0">{sub}</text>}
      {tag && <text x={x + 16} y={y + (h - 14)} fontSize={10} fill={color} fontWeight={700}>{tag}</text>}
    </g>
  );
}

function Edge({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b8ba0" strokeWidth={1.5} markerEnd="url(#arrow-arch)" />
      {label && (
        <>
          <text x={mx} y={my - 6} fontSize={10} fill="#000" stroke="#000" strokeWidth={3} opacity={0.6} textAnchor="middle">{label}</text>
          <text x={mx} y={my - 6} fontSize={10} fill="#8b8ba0" textAnchor="middle">{label}</text>
        </>
      )}
    </g>
  );
}
