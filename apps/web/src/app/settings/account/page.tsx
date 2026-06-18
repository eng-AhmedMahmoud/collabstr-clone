import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AccountForm } from "./account-form";

export const metadata = { title: "Account — Collabstr" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/account");
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Account</h1>
      <AccountForm initialName={me.name} email={me.email} avatarUrl={me.avatarUrl ?? null} />
    </div>
  );
}
