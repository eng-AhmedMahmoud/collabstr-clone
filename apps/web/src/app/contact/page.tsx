import { t } from "@/lib/i18n";

export const metadata = { title: "Contact — Nakhla" };

export default async function ContactPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">{i.contact.title}</h1>
      <p className="text-muted mt-2">{i.contact.sub}</p>
      <form className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold">{i.contact.yourEmail}</span>
          <input type="email" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold">{i.contact.message}</span>
          <textarea rows={6} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
        </label>
        <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.contact.send}</button>
      </form>
    </div>
  );
}
