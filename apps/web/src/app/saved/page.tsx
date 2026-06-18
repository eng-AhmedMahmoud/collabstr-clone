import Link from "next/link";
import { redirect } from "next/navigation";
import { CreatorCard } from "@/components/creator-card";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiCreator } from "@/lib/types";

type Saved = { id: string; createdAt: string; creator: ApiCreator };

export const metadata = { title: "Saved creators — Collabstr" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/saved");
  const api = await serverApi();
  let saved: Saved[] = [];
  try { saved = await api.get<Saved[]>("/creators/me/saved"); } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Saved creators</h1>
      {saved.length === 0 ? (
        <p className="mt-8 text-center text-[#6b7280] text-sm">No saved creators yet. <Link href="/influencers" className="underline">Browse to save</Link>.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map((s) => <CreatorCard key={s.id} c={s.creator} />)}
        </div>
      )}
    </div>
  );
}
