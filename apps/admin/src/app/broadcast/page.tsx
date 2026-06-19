import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";
import { BroadcastForm } from "./form";
import { t as serverT } from "@/lib/i18n";

export const metadata = { title: "Broadcast · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/broadcast");
  const i = await serverT();
  return (
    <Shell me={me}>
      <PageHeader title={i.broadcast.title} subtitle={i.broadcast.sub} />
      <Card title={i.broadcast.cardTitle}>
        <BroadcastForm />
      </Card>
    </Shell>
  );
}
