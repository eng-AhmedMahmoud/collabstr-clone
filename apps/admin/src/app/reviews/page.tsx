import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo } from "@/lib/format";
import { DeleteReviewButton } from "./delete-button";

type Row = {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  author: { name: string };
  creator: { username: string; user: { name: string } };
};

export const metadata = { title: "Reviews · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/reviews");
  const api = await serverApi();
  let rows: Row[] = [];
  try { rows = await api.get<Row[]>("/admin/reviews"); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title="Reviews" subtitle={`${rows.length} latest reviews · click delete to remove abusive content`} />
      <Card padding={false}>
        <ul className="divide-y divide-[#1f1f30]">
          {rows.map((r) => (
            <li key={r.id} className="px-5 py-4 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{r.author.name}</span>
                  <span className="text-[#8b8ba0]">→</span>
                  <span className="font-bold">{r.creator.user.name}</span>
                  <span className="text-amber-400 ml-2">{"★".repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-[#d1d1da] mt-1">{r.text}</p>
                <p className="text-[11px] text-[#8b8ba0] mt-1">{fmtAgo(r.createdAt)}</p>
              </div>
              <DeleteReviewButton id={r.id} />
            </li>
          ))}
          {rows.length === 0 && <li className="px-5 py-12 text-center text-[#8b8ba0]">No reviews yet.</li>}
        </ul>
      </Card>
    </Shell>
  );
}
