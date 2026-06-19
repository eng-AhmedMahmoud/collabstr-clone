import Link from "next/link";
import { redirect } from "next/navigation";
import { CreatorCard } from "@/components/creator-card";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import type { ApiCreator } from "@/lib/types";

type Saved = { id: string; createdAt: string; creator: ApiCreator };

export const metadata = { title: "Saved creators — Nakhla" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/saved");
  const api = await serverApi();
  let saved: Saved[] = [];
  try { saved = await api.get<Saved[]>("/creators/me/saved"); } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.saved.title}</h1>
      {saved.length === 0 ? (
        <p className="mt-8 text-center text-muted text-sm">{i.saved.empty} <Link href="/influencers" className="underline">{i.saved.browse}</Link>.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map((s) => <CreatorCard key={s.id} c={s.creator} />)}
        </div>
      )}
    </div>
  );
}
