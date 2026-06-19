import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "For creators — Nakhla" };

export default async function ForCreatorsPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold text-brand">{i.forCreators.eyebrow}</p>
      <h1 className="text-4xl sm:text-6xl font-black mt-2 leading-tight">
        {i.forCreators.titlePre} <span className="brand-text">{i.forCreators.titleAccent}</span>
      </h1>
      <p className="text-lg text-fg/80 mt-5 max-w-2xl">
        {i.forCreators.sub}
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/signup" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.forCreators.joinFree}</Link>
        <Link href="/influencers" className="px-5 py-3 rounded-xl border border-border font-bold">{i.forCreators.examples}</Link>
      </div>

      <div className="mt-14 grid sm:grid-cols-3 gap-5">
        {i.forCreators.steps.map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-border bg-elevated p-6">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-muted text-sm mt-1.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
