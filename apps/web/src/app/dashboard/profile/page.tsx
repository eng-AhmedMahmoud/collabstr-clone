import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import { BrandProfileForm, type BrandMe } from "./brand-profile-form";

export const metadata = { title: "Edit brand profile — Nakhla" };
export const dynamic = "force-dynamic";

export default async function BrandProfilePage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/dashboard/profile");
  if (me.role !== "brand") redirect("/creator-dashboard");

  const api = await serverApi();
  let profile: BrandMe | null = null;
  try { profile = await api.get<BrandMe>("/users/me/brand"); } catch {}

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-fg">← {i.brandProfile.back}</Link>
      <h1 className="text-3xl font-black mt-3">{i.brandProfile.title}</h1>
      <p className="text-sm text-muted mt-1">{i.brandProfile.sub}</p>
      {profile ? (
        <BrandProfileForm initial={profile} />
      ) : (
        <p className="mt-8 text-sm text-red-600">{i.brandProfile.loadError}</p>
      )}
    </div>
  );
}
