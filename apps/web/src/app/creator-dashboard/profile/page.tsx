import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import { CreatorProfileForm, type CreatorMe } from "./profile-form";

export const metadata = { title: "Edit profile — Nakhla" };
export const dynamic = "force-dynamic";

export default async function CreatorProfilePage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/creator-dashboard/profile");
  if (me.role !== "creator") redirect("/dashboard");

  const api = await serverApi();
  let profile: CreatorMe | null = null;
  try { profile = await api.get<CreatorMe>("/creators/me"); } catch {}

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/creator-dashboard" className="text-sm text-muted hover:text-fg">← {i.creatorProfile.back}</Link>
      <h1 className="text-3xl font-black mt-3">{i.creatorProfile.title}</h1>
      <p className="text-sm text-muted mt-1">{i.creatorProfile.sub}</p>
      {profile ? (
        <CreatorProfileForm initial={profile} />
      ) : (
        <p className="mt-8 text-sm text-red-600">{i.creatorProfile.loadError}</p>
      )}
    </div>
  );
}
