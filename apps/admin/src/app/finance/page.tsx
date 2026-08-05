import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, EmptyState, ErrorBanner, Pill } from "@/components/ui";
import { ResponsiveTable } from "@/components/responsive-table";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { getLocale, fmtDate, fmtAgo, TIMEZONE } from "@/lib/format";
import { Money } from "@/components/money";
import { t as serverT } from "@/lib/i18n";
import { RunReconciliationButton } from "./run-button";

type ReconRun = {
  id: string;
  rangeStart: string;
  rangeEnd: string;
  moneyIn: number;
  refunds: number;
  payouts: number;
  commission: number;
  escrowOutstanding: number;
  delta: number;
  ok: boolean;
  createdAt: string;
};

type WebhookEvent = {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  signatureValid: boolean;
  processedAt: string | null;
  error: string | null;
  createdAt: string;
};

export const metadata = { title: "Finance · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/finance");
  const i = await serverT();
  const locale = await getLocale();
  const intl = locale === "ar" ? "ar-SA" : "en-SA";
  const api = await serverApi();

  // Both endpoints are new — each degrades independently if it 404s.
  const [reconRes, hooksRes] = await Promise.allSettled([
    api.get<{ runs?: ReconRun[] }>("/admin/reconciliation?take=30"),
    api.get<{ events?: WebhookEvent[] }>("/admin/webhooks?take=50"),
  ]);
  const runs: ReconRun[] = reconRes.status === "fulfilled" ? reconRes.value?.runs ?? [] : [];
  const events: WebhookEvent[] = hooksRes.status === "fulfilled" ? hooksRes.value?.events ?? [] : [];
  const reconError = reconRes.status === "rejected";
  const hooksError = hooksRes.status === "rejected";

  const dShort = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString(intl, { timeZone: TIMEZONE, month: "short", day: "numeric" }) : "—";

  return (
    <Shell me={me}>
      <PageHeader title={i.finance.title} subtitle={i.finance.sub} action={<RunReconciliationButton />} />

      {reconError ? (
        <ErrorBanner title={i.common.apiError} body={i.common.apiErrorBody} />
      ) : (
        <Card title={i.finance.recon} padding={false}>
          {runs.length === 0 ? (
            <EmptyState title={i.finance.reconNone} body={i.finance.reconNoneBody} />
          ) : (
            <ResponsiveTable minWidth={920} className="border-0 rounded-none">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
                  <tr>
                    <th className="text-start px-4 sm:px-5 py-2">{i.finance.colDate}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colMoneyIn}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colRefunds}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colPayouts}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colCommission}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colEscrow}</th>
                    <th className="text-end px-4 sm:px-5 py-2">{i.finance.colDelta}</th>
                    <th className="text-start px-4 sm:px-5 py-2 pe-5">{i.finance.colOk}</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b last:border-0 border-border hover:bg-surface-2/40 ${r?.ok === false ? "bg-red-500/5" : ""}`}
                    >
                      <td className="px-4 sm:px-5 py-3">
                        <p className="font-semibold whitespace-nowrap">{fmtDate(r.createdAt, locale)}</p>
                        <p className="text-[11px] text-muted whitespace-nowrap">
                          {dShort(r.rangeStart)}{" "}
                          <span className="rtl:hidden">→</span><span className="hidden rtl:inline">←</span>{" "}
                          {dShort(r.rangeEnd)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-end"><bdi><Money value={r.moneyIn} locale={intl} /></bdi></td>
                      <td className="px-4 sm:px-5 py-3 text-end"><bdi><Money value={r.refunds} locale={intl} /></bdi></td>
                      <td className="px-4 sm:px-5 py-3 text-end"><bdi><Money value={r.payouts} locale={intl} /></bdi></td>
                      <td className="px-4 sm:px-5 py-3 text-end"><bdi><Money value={r.commission} locale={intl} /></bdi></td>
                      <td className="px-4 sm:px-5 py-3 text-end"><bdi><Money value={r.escrowOutstanding} locale={intl} /></bdi></td>
                      <td className={`px-4 sm:px-5 py-3 text-end font-bold ${r?.ok === false ? "text-red-300" : ""}`}>
                        <bdi><Money value={r.delta} locale={intl} /></bdi>
                      </td>
                      <td className="px-4 sm:px-5 py-3 pe-5">
                        <Pill kind={r?.ok === false ? "bad" : "ok"}>{r?.ok === false ? i.finance.notOk : i.finance.ok}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </Card>
      )}

      <div className="mt-6">
        {hooksError ? (
          <ErrorBanner title={i.common.apiError} body={i.common.apiErrorBody} />
        ) : (
          <Card title={i.finance.webhooks} padding={false}>
            {events.length === 0 ? (
              <EmptyState title={i.finance.webhooksNone} body={i.finance.webhooksNoneBody} />
            ) : (
              <ResponsiveTable minWidth={860} className="border-0 rounded-none">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
                    <tr>
                      <th className="text-start px-4 sm:px-5 py-2">{i.finance.colProvider}</th>
                      <th className="text-start px-4 sm:px-5 py-2">{i.finance.colEvent}</th>
                      <th className="text-start px-4 sm:px-5 py-2">{i.finance.colSignature}</th>
                      <th className="text-start px-4 sm:px-5 py-2">{i.finance.colProcessed}</th>
                      <th className="text-start px-4 sm:px-5 py-2">{i.finance.colError}</th>
                      <th className="text-end px-4 sm:px-5 py-2 pe-5">{i.finance.colReceived}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-b last:border-0 border-border hover:bg-surface-2/40 ${e?.error ? "bg-red-500/5" : ""}`}
                      >
                        <td className="px-4 sm:px-5 py-3 font-semibold">{e.provider}</td>
                        <td className="px-4 sm:px-5 py-3">
                          <p className="font-semibold">{e.eventType}</p>
                          <p className="text-[11px] text-muted font-mono truncate max-w-[220px]" dir="ltr">{e.eventId}</p>
                        </td>
                        <td className="px-4 sm:px-5 py-3">
                          <Pill kind={e?.signatureValid ? "ok" : "bad"}>
                            {e?.signatureValid ? i.finance.sigValid : i.finance.sigInvalid}
                          </Pill>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-muted whitespace-nowrap">
                          {e.processedAt ? fmtDate(e.processedAt, locale) : "—"}
                        </td>
                        <td className="px-4 sm:px-5 py-3">
                          {e.error
                            ? <span className="text-xs text-red-300 line-clamp-2 max-w-[260px] break-words" title={e.error}>{e.error}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-end text-muted whitespace-nowrap pe-5">{fmtAgo(e.createdAt, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            )}
          </Card>
        )}
      </div>
    </Shell>
  );
}
