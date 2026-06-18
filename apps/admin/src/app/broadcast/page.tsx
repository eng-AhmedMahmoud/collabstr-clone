import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";
import { BroadcastForm } from "./form";

export const metadata = { title: "Broadcast · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/broadcast");
  return (
    <Shell me={me}>
      <PageHeader title="Broadcast" subtitle="Send a system notification to a slice of users." />
      <Card title="Compose">
        <BroadcastForm />
      </Card>
    </Shell>
  );
}
