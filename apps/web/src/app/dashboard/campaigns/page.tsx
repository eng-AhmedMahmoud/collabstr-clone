import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";
import { CampaignsManager, type ManagedCampaign } from "./campaigns-manager";

export const metadata = { title: "Manage campaigns — Nakhla" };
export const dynamic = "force-dynamic";

export default async function ManageCampaignsPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/dashboard/campaigns");
  if (me.role !== "brand") redirect("/creator-dashboard");

  const api = await serverApi();
  let campaigns: ManagedCampaign[] = [];
  try { campaigns = await api.get<ManagedCampaign[]>("/campaigns/mine"); } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-fg">← {i.campaignManage.back}</Link>
      <div className="mt-3 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black">{i.campaignManage.title}</h1>
          <p className="text-sm text-muted mt-1">{i.campaignManage.sub}</p>
        </div>
        <Link href="/campaigns/new" className="px-4 py-2.5 rounded-xl brand-gradient text-white font-semibold">{i.campaignManage.newCampaign}</Link>
      </div>
      <CampaignsManager initial={campaigns} />
    </div>
  );
}
