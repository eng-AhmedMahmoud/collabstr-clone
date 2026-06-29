type Node = { id: string; label: string; x: number; y: number; kind: "start" | "live" | "terminal" | "bad" };
type Edge = { from: string; to: string; label: string; actor: "brand" | "creator" | "system" | "admin" };

const NODES: Node[] = [
  { id: "pending_payment",    label: "pending payment",     x: 60,   y: 200, kind: "start" },
  { id: "awaiting_creator",   label: "awaiting creator",    x: 260,  y: 200, kind: "live" },
  { id: "in_progress",        label: "in progress",         x: 460,  y: 200, kind: "live" },
  { id: "submitted",          label: "submitted",           x: 660,  y: 200, kind: "live" },
  { id: "revision_requested", label: "revision requested",  x: 660,  y: 80,  kind: "live" },
  { id: "approved",           label: "approved",            x: 860,  y: 200, kind: "live" },
  { id: "released",           label: "released",            x: 1060, y: 200, kind: "terminal" },
  { id: "cancelled",          label: "cancelled",           x: 460,  y: 360, kind: "bad" },
  { id: "disputed",           label: "disputed",            x: 860,  y: 360, kind: "bad" },
];

const EDGES: Edge[] = [
  { from: "pending_payment",    to: "awaiting_creator",   label: "pay (escrow)",      actor: "brand" },
  { from: "awaiting_creator",   to: "in_progress",        label: "accept",            actor: "creator" },
  { from: "in_progress",        to: "submitted",          label: "submit delivery",   actor: "creator" },
  { from: "submitted",          to: "revision_requested", label: "request revision",  actor: "brand" },
  { from: "revision_requested", to: "submitted",          label: "resubmit",          actor: "creator" },
  { from: "submitted",          to: "approved",           label: "approve",           actor: "brand" },
  { from: "approved",           to: "released",           label: "release funds",     actor: "brand" },
  { from: "approved",           to: "released",           label: "force release",     actor: "admin" },
  { from: "in_progress",        to: "cancelled",          label: "cancel",            actor: "brand" },
  { from: "awaiting_creator",   to: "cancelled",          label: "cancel",            actor: "brand" },
  { from: "submitted",          to: "disputed",           label: "open dispute",      actor: "brand" },
  { from: "disputed",           to: "released",           label: "resolved → creator", actor: "admin" },
  { from: "disputed",           to: "cancelled",          label: "resolved → refund",  actor: "admin" },
];

const COLORS = {
  start: "#a78bfa",
  live: "#d1d1da",
  terminal: "#10b981",
  bad: "#ef4444",
  brand: "#a78bfa",
  creator: "#ec4899",
  system: "#8b8ba0",
  admin: "#f59e0b",
};

const NODE_W = 150;
const NODE_H = 50;

export function OrderStateMachine() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div className="card p-6 overflow-x-auto">
      <svg viewBox="0 0 1240 460" className="w-full min-w-[900px]">
        <defs>
          {(["brand", "creator", "system", "admin"] as const).map((a) => (
            <marker key={a} id={`arrow-${a}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS[a]} />
            </marker>
          ))}
        </defs>

        {EDGES.map((e, i) => {
          const from = byId[e.from]!;
          const to = byId[e.to]!;
          const fromX = from.x + NODE_W / 2;
          const fromY = from.y + NODE_H / 2;
          const toX = to.x + NODE_W / 2;
          const toY = to.y + NODE_H / 2;
          const dx = toX - fromX;
          const dy = toY - fromY;
          const len = Math.hypot(dx, dy);
          const nx = -dy / len;
          const ny = dx / len;
          const startX = fromX + (dx / len) * NODE_W / 2;
          const startY = fromY + (dy / len) * NODE_H / 2;
          const endX = toX - (dx / len) * NODE_W / 2;
          const endY = toY - (dy / len) * NODE_H / 2;
          const sign = i % 2 === 0 ? 1 : -1;
          const cX = (startX + endX) / 2 + nx * 35 * sign * 0.4;
          const cY = (startY + endY) / 2 + ny * 35 * sign * 0.4;
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path d={`M ${startX} ${startY} Q ${cX} ${cY} ${endX} ${endY}`} stroke={COLORS[e.actor]} strokeWidth={1.5} fill="none" markerEnd={`url(#arrow-${e.actor})`} opacity={0.85} />
              <text x={cX} y={cY - 4} fontSize={10} fill={COLORS[e.actor]} textAnchor="middle" fontWeight={600}>{e.label}</text>
            </g>
          );
        })}

        {NODES.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={10} fill="#11111c" stroke={COLORS[n.kind]} strokeWidth={2} />
            <text x={n.x + NODE_W / 2} y={n.y + 20} fontSize={11} fontWeight={800} fill="#f5f5f7" textAnchor="middle">{n.label}</text>
            <text x={n.x + NODE_W / 2} y={n.y + 36} fontSize={9} fill={COLORS[n.kind]} textAnchor="middle" fontWeight={700}>{n.kind.toUpperCase()}</text>
          </g>
        ))}
      </svg>

      <div className="mt-5 flex flex-wrap gap-4 text-xs">
        {(["start", "live", "terminal", "bad"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded" style={{ background: COLORS[k] }} />
            <span className="font-semibold capitalize text-fg/85">{k}</span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3 text-fg/85">
          {(["brand", "creator", "admin", "system"] as const).map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ background: COLORS[a] }} />
              {a}
            </span>
          ))}
        </span>
      </div>

      <p className="text-xs text-muted mt-4">
        Transitions guarded server-side by <code className="bg-bg px-1.5 py-0.5 rounded">orders.service.ts</code> for users and <code className="bg-bg px-1.5 py-0.5 rounded">admin.service.ts</code> for force overrides.
      </p>
    </div>
  );
}
