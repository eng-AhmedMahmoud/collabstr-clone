import Link from "next/link";
import { t } from "@/lib/i18n";

export default async function NotFound() {
  const i = await t();
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div>
        <p className="text-6xl">🔍</p>
        <h1 className="text-3xl font-black mt-4">{i.notFound.title}</h1>
        <p className="text-muted mt-2">{i.notFound.sub}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">{i.notFound.home}</Link>
          <Link href="/influencers" className="px-5 py-3 rounded-xl border border-border font-semibold">{i.notFound.browse}</Link>
        </div>
      </div>
    </div>
  );
}
