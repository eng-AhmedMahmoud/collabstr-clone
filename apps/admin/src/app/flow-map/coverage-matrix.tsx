type Row = { route: string; app: "web" | "admin"; logout: boolean; brand: boolean; creator: boolean; admin: boolean; notes?: string };

const ROUTES: Row[] = [
  { app: "web", route: "/", logout: true, brand: true, creator: true, admin: true },
  { app: "web", route: "/influencers", logout: true, brand: true, creator: true, admin: true },
  { app: "web", route: "/[username]", logout: true, brand: true, creator: true, admin: true },
  { app: "web", route: "/signup · /login", logout: true, brand: false, creator: false, admin: false },
  { app: "web", route: "/forgot-password · /verify-email", logout: true, brand: true, creator: true, admin: true, notes: "Email sender stub" },
  { app: "web", route: "/pricing · /for-creators · /about · /contact · /help · /terms · /privacy", logout: true, brand: true, creator: true, admin: true },
  { app: "web", route: "/dashboard", logout: false, brand: true, creator: false, admin: false, notes: "redirects creators" },
  { app: "web", route: "/orders + /orders/[id]", logout: false, brand: true, creator: true, admin: false, notes: "state-machine actions" },
  { app: "web", route: "/checkout · /cart", logout: false, brand: true, creator: false, admin: false },
  { app: "web", route: "/saved", logout: false, brand: true, creator: false, admin: false },
  { app: "web", route: "/campaigns + /[id]", logout: true, brand: true, creator: true, admin: true, notes: "applicant list if owner" },
  { app: "web", route: "/campaigns/new", logout: false, brand: true, creator: false, admin: false },
  { app: "web", route: "/creator-dashboard + /packages + /orders", logout: false, brand: false, creator: true, admin: false },
  { app: "web", route: "/messages", logout: false, brand: true, creator: true, admin: false, notes: "polling, no WS yet" },
  { app: "web", route: "/notifications", logout: false, brand: true, creator: true, admin: false },
  { app: "web", route: "/settings + /account /security /notifications /billing", logout: false, brand: true, creator: true, admin: false },
  { app: "admin", route: "/login", logout: true, brand: false, creator: false, admin: true },
  { app: "admin", route: "/ (overview)", logout: false, brand: false, creator: false, admin: true },
  { app: "admin", route: "/users", logout: false, brand: false, creator: false, admin: true, notes: "ban / unban / promote" },
  { app: "admin", route: "/creators · /brands · /campaigns", logout: false, brand: false, creator: false, admin: true },
  { app: "admin", route: "/orders + /orders/[id]", logout: false, brand: false, creator: false, admin: true, notes: "force release / cancel / dispute" },
  { app: "admin", route: "/disputes", logout: false, brand: false, creator: false, admin: true },
  { app: "admin", route: "/payouts", logout: false, brand: false, creator: false, admin: true, notes: "creator earnings rollup" },
  { app: "admin", route: "/reviews", logout: false, brand: false, creator: false, admin: true },
  { app: "admin", route: "/audit", logout: false, brand: false, creator: false, admin: true, notes: "admin event trail" },
  { app: "admin", route: "/broadcast", logout: false, brand: false, creator: false, admin: true, notes: "system notifications" },
  { app: "admin", route: "/flow-map", logout: false, brand: false, creator: false, admin: true, notes: "this page" },
  { app: "admin", route: "/settings", logout: false, brand: false, creator: false, admin: true },
];

function Cell({ on }: { on: boolean }) {
  return on ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-[#3f3f4f]">—</span>;
}

export function CoverageMatrix() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
              <th className="text-left p-3">App</th>
              <th className="text-left p-3">Route</th>
              <th className="p-3">Logout</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Creator</th>
              <th className="p-3">Admin</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map((r) => (
              <tr key={`${r.app}:${r.route}`} className="border-t border-border">
                <td className="p-3"><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${r.app === "admin" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>{r.app}</span></td>
                <td className="p-3 font-mono text-xs">{r.route}</td>
                <td className="p-3 text-center"><Cell on={r.logout} /></td>
                <td className="p-3 text-center"><Cell on={r.brand} /></td>
                <td className="p-3 text-center"><Cell on={r.creator} /></td>
                <td className="p-3 text-center"><Cell on={r.admin} /></td>
                <td className="p-3 text-xs text-muted">{r.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
