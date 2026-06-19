import { t } from "@/lib/i18n";

export const metadata = { title: "About — Nakhla" };

export default async function AboutPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">
        {i.about.title} <span className="brand-text">{i.brand.name}</span>
      </h1>
      <p className="text-lg text-fg/80 mt-4 leading-relaxed">
        {i.about.p1}
      </p>
      <p className="text-muted mt-6 text-sm">
        {i.about.p2}
      </p>
    </div>
  );
}
