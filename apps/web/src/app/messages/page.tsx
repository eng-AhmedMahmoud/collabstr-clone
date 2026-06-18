import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { MessagesUI } from "./messages-ui";

type Thread = {
  id: string;
  lastMessageAt: string;
  brand: { id: string; name: string; avatarUrl: string | null };
  creator: { id: string; name: string; avatarUrl: string | null };
  messages: { id: string; body: string; createdAt: string; senderId: string }[];
};

export const metadata = { title: "Messages — Collabstr" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: { searchParams: Promise<{ to?: string }> }) {
  const me = await getSession();
  if (!me) redirect("/login?next=/messages");
  const api = await serverApi();
  const { to } = await searchParams;

  if (to && me.role === "brand") {
    try { await api.post<{ id: string }>(`/threads/open/${encodeURIComponent(to)}`); } catch {}
  }

  let threads: Thread[] = [];
  try { threads = await api.get<Thread[]>("/threads"); } catch {}

  return <MessagesUI me={{ id: me.id, role: me.role }} threads={threads} />;
}
