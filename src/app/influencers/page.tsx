import { CreatorCard } from "@/components/creator-card";
import { FilterBar } from "@/components/filter-bar";
import { CREATORS } from "@/lib/data";

export const metadata = { title: "Find creators — Collabstr" };

export default function InfluencersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-black">Find creators</h1>
      <p className="text-[#6b7280] mt-1">Search {CREATORS.length.toLocaleString()} vetted creators across every platform.</p>

      <div className="mt-6 sticky top-16 z-30 bg-white/95 backdrop-blur py-3 -mx-2 px-2">
        <FilterBar />
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-[#6b7280]">
        <p>Showing {CREATORS.length} of 910,000+ creators</p>
        <label className="flex items-center gap-2">
          Sort by
          <select className="rounded-lg border border-[#e5e7eb] px-2 py-1.5 text-sm bg-white">
            <option>Relevance</option>
            <option>Followers — high to low</option>
            <option>Price — low to high</option>
            <option>Rating</option>
            <option>Newest</option>
          </select>
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CREATORS.map((c) => (
          <CreatorCard key={c.username} c={c} />
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-12">
        <button className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-sm font-medium">← Prev</button>
        {[1, 2, 3, 4, "…", 92].map((n, i) => (
          <button key={i} className={`px-3.5 py-2 rounded-lg text-sm font-medium ${n === 1 ? "bg-[#0b0b14] text-white" : "border border-[#e5e7eb]"}`}>
            {n}
          </button>
        ))}
        <button className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-sm font-medium">Next →</button>
      </div>
    </div>
  );
}
