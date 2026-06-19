import { t } from "@/lib/i18n";

export const metadata = { title: "Terms — Nakhla" };

export default async function TermsPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose">
      <h1 className="text-4xl font-black">{i.terms.title}</h1>
      <p className="text-muted mt-4">{i.terms.updated}</p>
      <p className="mt-4 text-fg/80">
        {i.terms.body}
      </p>
    </div>
  );
}
