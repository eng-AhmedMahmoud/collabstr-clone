import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";

export const metadata = { title: "Notification settings — Nakhla" };

export default async function NotificationSettings() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/notifications");
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.settings.notif.title}</h1>
      <form className="mt-6 rounded-2xl border border-border bg-elevated p-6 space-y-4">
        {i.settings.notif.items.map(([title, desc]) => (
          <div key={title} className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted">{desc}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> {i.settings.notif.email}</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> {i.settings.notif.push}</label>
            </div>
          </div>
        ))}
        <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.settings.notif.savePref}</button>
      </form>
    </div>
  );
}
