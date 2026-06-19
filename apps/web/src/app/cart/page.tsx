import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata = { title: "Cart — Nakhla" };

export default async function CartPage() {
  const i = await t();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black">{i.cart.title}</h1>
      <div className="mt-8 rounded-2xl border border-border bg-elevated p-10 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 text-fg/80">{i.cart.empty}</p>
        <p className="text-muted text-sm mt-1">{i.cart.sub}</p>
        <Link href="/influencers" className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold">
          {i.cart.findCreators}
        </Link>
      </div>
      <p className="text-xs text-muted mt-4 text-center">
        {i.cart.note}
      </p>
    </div>
  );
}
