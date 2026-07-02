import { t } from "@/lib/i18n";

export const metadata = { title: "Privacy — Nakhla" };

export default async function PrivacyPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">{i.privacy.title}</h1>
      <p className="text-muted mt-4">{i.privacy.updated}</p>
      <p className="mt-6 text-fg/80 leading-relaxed">{i.privacy.intro}</p>
      <div className="mt-10 space-y-8">
        {i.privacy.sections.map(([heading, body], idx) => (
          <section key={heading}>
            <h2 className="text-xl font-bold">
              <span className="text-brand me-2">{idx + 1}.</span>
              {heading}
            </h2>
            <p className="mt-2 text-fg/80 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
