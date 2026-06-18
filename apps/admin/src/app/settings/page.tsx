import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";

export const metadata = { title: "Settings · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/settings");
  return (
    <Shell me={me}>
      <PageHeader title="Settings" subtitle="Admin console preferences" />
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Account">
          <div className="space-y-2 text-sm">
            <p><span className="text-[#8b8ba0]">Name:</span> <span className="font-semibold">{me.name}</span></p>
            <p><span className="text-[#8b8ba0]">Email:</span> {me.email}</p>
            <p><span className="text-[#8b8ba0]">Role:</span> <span className="font-semibold">admin</span></p>
          </div>
          <p className="text-xs text-[#8b8ba0] mt-3">Edit through the marketplace settings page.</p>
        </Card>
        <Card title="Roadmap items">
          <ul className="text-sm text-[#d1d1da] space-y-2">
            <li>· Admin role granularity (ops / finance / mod)</li>
            <li>· 2FA enforcement on admin accounts</li>
            <li>· Per-admin audit attribution (currently order-level only)</li>
            <li>· Feature flags toggleable from here</li>
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
