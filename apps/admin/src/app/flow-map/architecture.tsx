export function Architecture() {
  return (
    <div className="card p-6 overflow-x-auto">
      <svg viewBox="0 0 1200 460" className="w-full min-w-[900px]">
        <defs>
          <marker id="arrow-arch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b8ba0" />
          </marker>
        </defs>

        <Box x={20} y={40} w={170} h={100} title="Browser" sub="Public marketplace" tag="React 19" color="#d1d1da" />
        <Box x={20} y={180} w={170} h={100} title="Browser" sub="Admin console" tag="this app" color="#ec4899" />

        <Box x={260} y={40} w={220} h={100} title="apps/web (Nakhla)" sub="Next.js · /api/v1 rewrite" tag="collabstr-web.localhost" color="#7c3aed" />
        <Box x={260} y={180} w={220} h={100} title="apps/admin" sub="Next.js · admin-only" tag="collabstr-admin.localhost" color="#ec4899" />

        <Box x={560} y={110} w={260} h={100} title="apps/api (NestJS)" sub="JWT cookies · Zod · role guards" tag="collabstr-api.localhost" color="#a78bfa" />

        <Box x={900} y={110} w={150} h={100} title="PostgreSQL" sub="Prisma ORM" tag="55432" color="#0ea5e9" />

        <Box x={260} y={330} w={520} h={70} title="Modules" sub="auth · users · creators · packages · campaigns · applications · orders · messages · reviews · notifications · admin" color="#10b981" small />
        <Box x={20} y={330} w={210} h={70} title="@collabstr/shared-types" sub="Zod schemas reused web↔admin↔api" color="#f59e0b" small />

        <Edge x1={190} y1={90} x2={260} y2={90} label="HTTPS" />
        <Edge x1={190} y1={230} x2={260} y2={230} label="HTTPS" />
        <Edge x1={480} y1={90} x2={560} y2={140} label="rewrite" />
        <Edge x1={480} y1={230} x2={560} y2={180} label="rewrite" />
        <Edge x1={820} y1={160} x2={900} y2={160} label="TCP 5432" />
        <Edge x1={690} y1={210} x2={520} y2={330} label="" />
      </svg>
    </div>
  );
}

function Box({ x, y, w, h, title, sub, tag, color, small }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tag?: string; color: string; small?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#11111c" stroke={color} strokeWidth={2} />
      <text x={x + 14} y={y + (small ? 24 : 32)} fontSize={small ? 13 : 16} fontWeight={800} fill="#f5f5f7">{title}</text>
      {sub && <text x={x + 14} y={y + (small ? 44 : 56)} fontSize={11} fill="#8b8ba0">{sub}</text>}
      {tag && <text x={x + 14} y={y + (h - 14)} fontSize={10} fill={color} fontWeight={700}>{tag}</text>}
    </g>
  );
}

function Edge({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b8ba0" strokeWidth={1.5} markerEnd="url(#arrow-arch)" />
      {label && <text x={mx} y={my - 6} fontSize={10} fill="#8b8ba0" textAnchor="middle">{label}</text>}
    </g>
  );
}
