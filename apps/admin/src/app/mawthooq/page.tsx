import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";
import { MawthooqReviewActions } from "./review-actions";

type Row = {
  id: string;
  username: string;
  city: string;
  mawthooqStatus: "none" | "pending" | "verified" | "rejected" | "expired";
  mawthooqLicenseNo: string | null;
  mawthooqSubmittedAt: string | null;
  mawthooqExpiresAt: string | null;
  mawthooqReviewNote: string | null;
  user: { name: string; email: string };
};

const PILL: Record<Row["mawthooqStatus"], "ok" | "warn" | "bad" | "muted"> = {
  none: "muted", pending: "warn", verified: "ok", rejected: "bad", expired: "bad",
};

export const metadata = { title: "Licences · Admin" };
export const dynamic = "force-dynamic";

export default async function MawthooqAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/mawthooq");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/mawthooq"); } catch {}

  const webBase = process.env.NEXT_PUBLIC_WEB_URL ?? "https://collabstr-clone.vercel.app";

  return (
    <Shell me={me}>
      <PageHeader title={i.mawthooq.title} subtitle={`${rows.length} ${i.mawthooq.countSuffix}`} />
      <p className="text-sm text-muted mb-4 max-w-2xl">{i.mawthooq.subtitle}</p>
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="text-left px-5 py-2">{i.mawthooq.colCreator}</th>
              <th className="text-left px-5 py-2">{i.mawthooq.colLicense}</th>
              <th className="text-left px-5 py-2">{i.mawthooq.colStatus}</th>
              <th className="text-left px-5 py-2">{i.mawthooq.colSubmitted}</th>
              <th className="text-left px-5 py-2">{i.mawthooq.colExpiry}</th>
              <th className="text-right px-5 py-2 pr-5">{i.mawthooq.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 border-border hover:bg-surface-2/40 align-top">
                <td className="px-5 py-3">
                  <Link href={`${webBase}/${r.username}`} target="_blank" className="font-semibold hover:text-emerald-300">{r.user.name}</Link>
                  <p className="text-[11px] text-muted">@{r.username} · {r.city}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs" dir="ltr">{r.mawthooqLicenseNo ?? "—"}</td>
                <td className="px-5 py-3"><Pill kind={PILL[r.mawthooqStatus]}>{i.mawthooq.status[r.mawthooqStatus]}</Pill></td>
                <td className="px-5 py-3 text-muted text-xs">{r.mawthooqSubmittedAt ? fmtAgo(r.mawthooqSubmittedAt) : "—"}</td>
                <td className="px-5 py-3 text-muted text-xs">{r.mawthooqExpiresAt ? new Date(r.mawthooqExpiresAt).toISOString().slice(0, 10) : "—"}</td>
                <td className="px-5 py-3 pr-5"><MawthooqReviewActions row={{ id: r.id, mawthooqStatus: r.mawthooqStatus }} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">{i.mawthooq.none}</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
