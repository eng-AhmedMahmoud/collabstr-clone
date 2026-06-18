import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";

type Notif = { id: string; kind: string; title: string; body?: string | null; href?: string | null; readAt?: string | null; createdAt: string };

export const metadata = { title: "Notifications — Nakhla" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/notifications");
  const api = await serverApi();
  let items: Notif[] = [];
  try { items = await api.get<Notif[]>("/notifications"); } catch {}

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Notifications</h1>
        <form action={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/notifications/read-all`} method="post">
          <button className="text-sm font-semibold text-brand">Mark all read</button>
        </form>
      </header>
      <div className="mt-6 rounded-2xl border border-border bg-elevated divide-y divide-border">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">All caught up.</p>
        ) : items.map((n) => (
          <div key={n.id} className={`p-5 ${n.readAt ? "" : "bg-brand-50/40"}`}>
            <div className="flex items-start gap-3">
              <span className="h-9 w-9 rounded-xl brand-gradient text-white grid place-items-center text-sm shrink-0">
                {n.kind[0].toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                {n.body && <p className="text-sm text-fg/80">{n.body}</p>}
                <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {n.href && <Link href={n.href} className="text-sm font-semibold text-brand">Open</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
