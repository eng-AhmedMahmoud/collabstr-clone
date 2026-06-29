import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";
import { t as serverT } from "@/lib/i18n";

export const metadata = { title: "Settings · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/settings");
  const i = await serverT();
  return (
    <Shell me={me}>
      <PageHeader title={i.settings.title} subtitle={i.settings.sub} />
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title={i.settings.account}>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted">{i.settings.name}</span> <span className="font-semibold">{me.name}</span></p>
            <p><span className="text-muted">{i.settings.email}</span> {me.email}</p>
            <p><span className="text-muted">{i.settings.role}</span> <span className="font-semibold">{i.settings.admin}</span></p>
          </div>
          <p className="text-xs text-muted mt-3">{i.settings.editNote}</p>
        </Card>
        <Card title={i.settings.roadmap}>
          <ul className="text-sm text-fg/85 space-y-2">
            {i.settings.roadmapItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
