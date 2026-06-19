import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtMoney, fmtNum, fmtAgo } from "@/lib/format";
import { t as serverT } from "@/lib/i18n";

type Row = {
  id: string;
  username: string;
  user: { name: string; email: string };
  startingPrice: number;
  rating: number;
  reviewsCount: number;
  followersIg: number | null;
  followersTt: number | null;
  followersYt: number | null;
  badges: string[];
  createdAt: string;
};

export const metadata = { title: "Creators · Admin" };
export const dynamic = "force-dynamic";

export default async function CreatorsAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/creators");
  const i = await serverT();
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/creators"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.creators.title} subtitle={`${rows.length} ${i.creators.countSuffix}`} />
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
            <tr>
              <th className="text-left px-5 py-2">{i.creators.colCreator}</th>
              <th className="text-left px-5 py-2">{i.creators.colFollowers}</th>
              <th className="text-left px-5 py-2">{i.creators.colRating}</th>
              <th className="text-right px-5 py-2">{i.creators.colFrom}</th>
              <th className="text-left px-5 py-2">{i.creators.colBadges}</th>
              <th className="text-right px-5 py-2 pr-5">{i.creators.colJoined}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const total = (c.followersIg ?? 0) + (c.followersTt ?? 0) + (c.followersYt ?? 0);
              return (
                <tr key={c.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                  <td className="px-5 py-3">
                    <Link href={`https://collabstr-web.localhost/${c.username}`} target="_blank" className="font-semibold hover:text-emerald-300">{c.user.name}</Link>
                    <p className="text-[11px] text-[#8b8ba0]">@{c.username} · {c.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-[#d1d1da]">{fmtNum(total)}</td>
                  <td className="px-5 py-3">★ {c.rating.toFixed(1)} <span className="text-[#8b8ba0]">({c.reviewsCount})</span></td>
                  <td className="px-5 py-3 text-right font-bold">{fmtMoney(c.startingPrice)}</td>
                  <td className="px-5 py-3"><div className="flex gap-1 flex-wrap">{c.badges.map((b) => <Pill key={b} kind="brand">{b}</Pill>)}</div></td>
                  <td className="px-5 py-3 text-right text-[#8b8ba0] pr-5">{fmtAgo(c.createdAt)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-[#8b8ba0]">{i.creators.none}</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
