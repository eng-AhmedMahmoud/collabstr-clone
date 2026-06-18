import Link from "next/link";

export const metadata = { title: "For creators — Collabstr" };

export default function ForCreatorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold text-[#7c3aed]">For creators</p>
      <h1 className="text-4xl sm:text-6xl font-black mt-2 leading-tight">
        Get paid to do <span className="brand-text">what you already do.</span>
      </h1>
      <p className="text-lg text-[#374151] mt-5 max-w-2xl">
        Set your packages, get discovered by brands, and ship content from one dashboard. No quotas, no exclusivity.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/signup" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Join free</Link>
        <Link href="/influencers" className="px-5 py-3 rounded-xl border border-[#e5e7eb] font-bold">See examples</Link>
      </div>

      <div className="mt-14 grid sm:grid-cols-3 gap-5">
        {[
          ["1. Build your profile", "Add packages, audience demographics, and portfolio work."],
          ["2. Get hired", "Brands book directly. Or you apply to open campaigns."],
          ["3. Deliver & get paid", "Submit content, get approved, funds release to you."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
            <h3 className="font-bold text-lg">{t}</h3>
            <p className="text-[#6b7280] text-sm mt-1.5">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
