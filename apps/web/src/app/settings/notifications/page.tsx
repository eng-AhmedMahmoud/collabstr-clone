import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = { title: "Notification settings — Collabstr" };

export default async function NotificationSettings() {
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/notifications");
  const items = [
    ["Order updates", "Status changes, deliveries, approvals."],
    ["New messages", "Replies in your inbox."],
    ["Campaign applications", "When a creator applies (brands only)."],
    ["Marketing", "Product updates and offers."],
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Notifications</h1>
      <form className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-4">
        {items.map(([t, d]) => (
          <div key={t} className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-[#6b7280]">{d}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Email</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Push</label>
            </div>
          </div>
        ))}
        <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Save preferences</button>
      </form>
    </div>
  );
}
