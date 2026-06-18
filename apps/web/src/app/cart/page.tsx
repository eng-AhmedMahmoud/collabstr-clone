import Link from "next/link";

export const metadata = { title: "Cart — Collabstr" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black">Your cart</h1>
      <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 text-[#374151]">Your cart is empty.</p>
        <p className="text-[#6b7280] text-sm mt-1">Open a creator profile and add a package to get started.</p>
        <Link href="/influencers" className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold">
          Find creators
        </Link>
      </div>
      <p className="text-xs text-[#6b7280] mt-4 text-center">
        Tip: clicking <strong>Add to cart</strong> on a profile takes you straight to checkout — cart batching is on the roadmap.
      </p>
    </div>
  );
}
