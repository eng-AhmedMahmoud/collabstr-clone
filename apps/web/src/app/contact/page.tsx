import { t } from "@/lib/i18n";

export const metadata = { title: "Contact — Nakhla" };

export default async function ContactPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">{i.contact.title}</h1>
      <p className="text-muted mt-2">{i.contact.sub}</p>
      <div className="mt-6 rounded-2xl border border-border bg-elevated p-8 text-center">
        <p className="text-4xl" aria-hidden>✉️</p>
        <h2 className="text-xl font-bold mt-3">{i.contact.emailTitle}</h2>
        <p className="text-muted mt-2">{i.contact.emailDesc}</p>
        <a
          href="mailto:hello@nakhla.sa"
          className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95"
        >
          {i.contact.emailCta}
        </a>
      </div>
    </div>
  );
}
