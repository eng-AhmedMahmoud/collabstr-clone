type Node = { id: string; label: string; x: number; y: number; kind: "start" | "live" | "terminal" | "bad" };
type Edge = { from: string; to: string; label: string; actor: "brand" | "creator" | "system" };

const NODES: Node[] = [
  { id: "pending_payment",  label: "pending payment",   x: 60,  y: 200, kind: "start" },
  { id: "awaiting_creator", label: "awaiting creator",  x: 260, y: 200, kind: "live" },
  { id: "in_progress",      label: "in progress",       x: 460, y: 200, kind: "live" },
  { id: "submitted",        label: "submitted",         x: 660, y: 200, kind: "live" },
  { id: "revision_requested", label: "revision requested", x: 660, y: 80, kind: "live" },
  { id: "approved",         label: "approved",          x: 860, y: 200, kind: "live" },
  { id: "released",         label: "released",          x: 1060, y: 200, kind: "terminal" },
  { id: "cancelled",        label: "cancelled",         x: 460, y: 360, kind: "bad" },
  { id: "disputed",         label: "disputed",          x: 860, y: 360, kind: "bad" },
];

const EDGES: Edge[] = [
  { from: "pending_payment", to: "awaiting_creator", label: "pay (escrow)", actor: "brand" },
  { from: "awaiting_creator", to: "in_progress", label: "accept", actor: "creator" },
  { from: "in_progress", to: "submitted", label: "submit delivery", actor: "creator" },
  { from: "submitted", to: "revision_requested", label: "request revision", actor: "brand" },
  { from: "revision_requested", to: "submitted", label: "resubmit", actor: "creator" },
  { from: "submitted", to: "approved", label: "approve", actor: "brand" },
  { from: "approved", to: "released", label: "release funds", actor: "brand" },
  { from: "in_progress", to: "cancelled", label: "cancel", actor: "brand" },
  { from: "awaiting_creator", to: "cancelled", label: "cancel", actor: "brand" },
  { from: "submitted", to: "disputed", label: "open dispute", actor: "brand" },
  { from: "disputed", to: "released", label: "resolved → creator", actor: "system" },
  { from: "disputed", to: "cancelled", label: "resolved → refund", actor: "system" },
];

const COLORS = {
  start: "#7c3aed",
  live: "#0b0b14",
  terminal: "#10b981",
  bad: "#ef4444",
  brand: "#7c3aed",
  creator: "#ec4899",
  system: "#6b7280",
};

const NODE_W = 150;
const NODE_H = 50;

export function OrderStateMachine() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 overflow-x-auto">
      <svg viewBox="0 0 1240 460" className="w-full min-w-[900px]">
        <defs>
          {(["brand","creator","system"] as const).map((a) => (
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
          const offsetMagnitude = 30;
          const nx = -dy / len;
          const ny = dx / len;
          const startX = fromX + (dx / len) * NODE_W / 2;
          const startY = fromY + (dy / len) * NODE_H / 2;
          const endX = toX - (dx / len) * NODE_W / 2;
          const endY = toY - (dy / len) * NODE_H / 2;
          const cX = (startX + endX) / 2 + nx * offsetMagnitude * (i % 2 === 0 ? 1 : -1) * 0.4;
          const cY = (startY + endY) / 2 + ny * offsetMagnitude * (i % 2 === 0 ? 1 : -1) * 0.4;

          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path
                d={`M ${startX} ${startY} Q ${cX} ${cY} ${endX} ${endY}`}
                stroke={COLORS[e.actor]}
                strokeWidth={1.5}
                fill="none"
                markerEnd={`url(#arrow-${e.actor})`}
                opacity={0.75}
              />
              <text x={cX} y={cY - 4} fontSize={10} fill={COLORS[e.actor]} textAnchor="middle" fontWeight={600}>
                {e.label}
              </text>
            </g>
          );
        })}

        {NODES.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={10} fill="white" stroke={COLORS[n.kind]} strokeWidth={2} />
            <text x={n.x + NODE_W / 2} y={n.y + 20} fontSize={11} fontWeight={800} fill="#0b0b14" textAnchor="middle">
              {n.label}
            </text>
            <text x={n.x + NODE_W / 2} y={n.y + 36} fontSize={9} fill={COLORS[n.kind]} textAnchor="middle" fontWeight={700}>
              {n.kind.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-5 flex flex-wrap gap-4 text-xs">
        {([
          ["start", "starting state"],
          ["live", "in-flight"],
          ["terminal", "happy ending"],
          ["bad", "failure / dispute"],
        ] as const).map(([k, d]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded" style={{ background: COLORS[k] }} />
            <span className="font-semibold">{d}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2 ml-auto">
          <span className="h-3 w-3 rounded" style={{ background: COLORS.brand }} />brand
          <span className="h-3 w-3 rounded ml-2" style={{ background: COLORS.creator }} />creator
          <span className="h-3 w-3 rounded ml-2" style={{ background: COLORS.system }} />system
        </span>
      </div>

      <p className="text-xs text-[#6b7280] mt-4">
        Transitions are validated server-side by <code>orders.service.ts</code>. Illegal jumps throw 400.
      </p>
    </div>
  );
}
