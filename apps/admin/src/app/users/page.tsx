import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, PageHeader, Pill } from "@/components/ui";
import { serverApi } from "@/lib/api";
import { getAdminSession } from "@/lib/session";
import { fmtAgo } from "@/lib/format";
import { UserRowActions } from "./row-actions";

type User = { id: string; name: string; email: string; role: "brand" | "creator" | "admin"; createdAt: string; bannedAt?: string | null; emailVerifiedAt?: string | null };

export const metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/users");
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.role) params.set("role", sp.role);
  if (sp.q) params.set("q", sp.q);
  const api = await serverApi();
  let users: User[] = [];
  try { users = await api.get<User[]>(`/admin/users?${params.toString()}`); } catch {}

  return (
    <Shell me={me}>
      <PageHeader title="Users" subtitle={`${users.length} matching · click a role pill below to filter`} />

      <Card padding={false}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1f1f30]">
          <form className="flex-1 flex gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Search email or name…" className="flex-1 px-3 py-2 rounded-lg bg-[#0b0b14] border border-[#1f1f30] text-sm" />
            <select name="role" defaultValue={sp.role ?? ""} className="px-3 py-2 rounded-lg bg-[#0b0b14] border border-[#1f1f30] text-sm">
              <option value="">All roles</option>
              <option value="brand">Brand</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
            <button className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold">Filter</button>
          </form>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-[#8b8ba0] border-b border-[#1f1f30]">
            <tr>
              <th className="text-left px-5 py-2">User</th>
              <th className="text-left px-5 py-2">Role</th>
              <th className="text-left px-5 py-2">Status</th>
              <th className="text-left px-5 py-2">Joined</th>
              <th className="text-right px-5 py-2 pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 border-[#1f1f30] hover:bg-[#161624]/40">
                <td className="px-5 py-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-[11px] text-[#8b8ba0]">{u.email}</p>
                </td>
                <td className="px-5 py-3"><Pill kind={u.role === "admin" ? "brand" : u.role === "creator" ? "warn" : "muted"}>{u.role}</Pill></td>
                <td className="px-5 py-3">
                  {u.bannedAt ? <Pill kind="bad">banned</Pill> : u.emailVerifiedAt ? <Pill kind="ok">verified</Pill> : <Pill kind="muted">unverified</Pill>}
                </td>
                <td className="px-5 py-3 text-[#8b8ba0]">{fmtAgo(u.createdAt)}</td>
                <td className="px-5 py-3 text-right pr-5">
                  <UserRowActions user={u} />
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-[#8b8ba0]">No users match.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
