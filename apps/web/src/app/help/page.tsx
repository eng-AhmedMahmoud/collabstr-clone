import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Help — Nakhla" };

export default async function HelpPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">{i.help.title}</h1>
      <p className="text-muted mt-2">{i.help.sub}</p>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-elevated">
        {i.help.items.map(([title, body]) => (
          <details key={title} className="p-5 group">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              {title}<span className="text-muted group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-muted mt-3 text-sm leading-relaxed">{body}</p>
          </details>
        ))}
      </div>
      <p className="text-center text-sm text-muted mt-6">
        {i.help.stuck} <Link href="/contact" className="underline">{i.help.contactSupport}</Link>.
      </p>
    </div>
  );
}
