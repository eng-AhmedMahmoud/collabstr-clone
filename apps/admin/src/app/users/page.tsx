import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo } from "@/lib/format";
import { UserRowActions } from "./row-actions";
import { t as serverT } from "@/lib/i18n";

type User = { id: string; name: string; email: string; role: "brand" | "creator" | "admin"; createdAt: string; bannedAt?: string | null; emailVerifiedAt?: string | null };

export const metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/users");
  const i = await serverT();
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.role) params.set("role", sp.role);
  if (sp.q) params.set("q", sp.q);
  const api = await serverApi();
  let users: User[] = [];
  try { users = await api.get<User[]>(`/admin/users?${params.toString()}`); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title={i.users.title} subtitle={`${users.length} ${i.users.countSuffix}`} />

      <Card padding={false}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <form className="flex-1 flex gap-2">
            <input name="q" defaultValue={sp.q} placeholder={i.users.searchPh} className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
            <select name="role" defaultValue={sp.role ?? ""} className="px-3 py-2 rounded-lg bg-bg border border-border text-sm">
              <option value="">{i.users.allRoles}</option>
              <option value="brand">{i.users.role.brand}</option>
              <option value="creator">{i.users.role.creator}</option>
              <option value="admin">{i.users.role.admin}</option>
            </select>
            <button className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold">{i.common.filter}</button>
          </form>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="text-left px-5 py-2">{i.users.colUser}</th>
              <th className="text-left px-5 py-2">{i.users.colRole}</th>
              <th className="text-left px-5 py-2">{i.users.colStatus}</th>
              <th className="text-left px-5 py-2">{i.users.colJoined}</th>
              <th className="text-right px-5 py-2 pr-5">{i.users.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 border-border hover:bg-surface-2/40">
                <td className="px-5 py-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-[11px] text-muted">{u.email}</p>
                </td>
                <td className="px-5 py-3"><Pill kind={u.role === "admin" ? "brand" : u.role === "creator" ? "warn" : "muted"}>{u.role}</Pill></td>
                <td className="px-5 py-3">
                  {u.bannedAt ? <Pill kind="bad">{i.users.pillBanned}</Pill> : u.emailVerifiedAt ? <Pill kind="ok">{i.users.pillVerified}</Pill> : <Pill kind="muted">{i.users.pillUnverified}</Pill>}
                </td>
                <td className="px-5 py-3 text-muted">{fmtAgo(u.createdAt)}</td>
                <td className="px-5 py-3 text-right pr-5">
                  <UserRowActions user={u} />
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">{i.users.noMatch}</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
