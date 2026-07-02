import { t } from "@/lib/i18n";

export const metadata = { title: "Terms — Nakhla" };

export default async function TermsPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">{i.terms.title}</h1>
      <p className="text-muted mt-4">{i.terms.updated}</p>
      <p className="mt-6 text-fg/80 leading-relaxed">{i.terms.intro}</p>
      <div className="mt-10 space-y-8">
        {i.terms.sections.map(([heading, body], idx) => (
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
