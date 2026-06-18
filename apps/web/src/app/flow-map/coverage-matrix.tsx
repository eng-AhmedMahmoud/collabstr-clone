type Row = { route: string; logout: boolean; brand: boolean; creator: boolean; notes?: string };

const ROUTES: Row[] = [
  { route: "/", logout: true, brand: true, creator: true },
  { route: "/influencers", logout: true, brand: true, creator: true },
  { route: "/[username]", logout: true, brand: true, creator: true },
  { route: "/signup", logout: true, brand: false, creator: false },
  { route: "/login", logout: true, brand: false, creator: false },
  { route: "/forgot-password", logout: true, brand: true, creator: true, notes: "Email sender stub" },
  { route: "/verify-email", logout: true, brand: true, creator: true, notes: "Email sender stub" },
  { route: "/for-creators · /pricing · /about · /contact · /help · /terms · /privacy", logout: true, brand: true, creator: true },
  { route: "/dashboard", logout: false, brand: true, creator: false, notes: "redirects creators" },
  { route: "/orders + /orders/[id]", logout: false, brand: true, creator: true, notes: "state-machine actions" },
  { route: "/cart", logout: false, brand: true, creator: false, notes: "single-package for now" },
  { route: "/checkout", logout: false, brand: true, creator: false },
  { route: "/saved", logout: false, brand: true, creator: false },
  { route: "/campaigns", logout: true, brand: true, creator: true },
  { route: "/campaigns/[id]", logout: true, brand: true, creator: true, notes: "applicant list if owner" },
  { route: "/campaigns/new", logout: false, brand: true, creator: false },
  { route: "/creator-dashboard", logout: false, brand: false, creator: true },
  { route: "/creator-dashboard/packages", logout: false, brand: false, creator: true },
  { route: "/creator-dashboard/orders", logout: false, brand: false, creator: true },
  { route: "/messages", logout: false, brand: true, creator: true, notes: "polling, no WS yet" },
  { route: "/notifications", logout: false, brand: true, creator: true, notes: "list exists; producers TODO" },
  { route: "/settings + /account /security /notifications /billing", logout: false, brand: true, creator: true },
  { route: "/flow-map", logout: true, brand: true, creator: true, notes: "this page" },
  { route: "/not-found", logout: true, brand: true, creator: true },
];

function Cell({ on }: { on: boolean }) {
  return on ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-[#9ca3af]">—</span>;
}

export function CoverageMatrix() {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f7f7fb] text-[#6b7280] text-xs uppercase">
              <th className="text-left p-3 font-semibold">Route</th>
              <th className="p-3 font-semibold">Logged-out</th>
              <th className="p-3 font-semibold">Brand</th>
              <th className="p-3 font-semibold">Creator</th>
              <th className="text-left p-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map((r) => (
              <tr key={r.route} className="border-t border-[#e5e7eb]">
                <td className="p-3 font-mono text-xs">{r.route}</td>
                <td className="p-3 text-center"><Cell on={r.logout} /></td>
                <td className="p-3 text-center"><Cell on={r.brand} /></td>
                <td className="p-3 text-center"><Cell on={r.creator} /></td>
                <td className="p-3 text-xs text-[#6b7280]">{r.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
