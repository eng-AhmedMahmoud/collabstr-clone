import Link from "next/link";
import { CreatorCard } from "@/components/creator-card";
import { FilterBar } from "@/components/filter-bar";
import { CATEGORIES, CREATORS } from "@/lib/data";
import type { Creator } from "@/lib/types";

export default function Home() {
  const featured = CREATORS.slice(0, 8);
  const instagram = CREATORS.filter((c) => c.platforms.includes("instagram")).slice(0, 4);
  const tiktok = CREATORS.filter((c) => c.platforms.includes("tiktok")).slice(0, 4);
  const youtube = CREATORS.filter((c) => c.platforms.includes("youtube")).slice(0, 4);
  const ugc = CREATORS.filter((c) => c.platforms.includes("ugc") || c.badges.includes("UGC")).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200 via-pink-200 to-amber-100 blur-3xl opacity-70" />
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-200 via-violet-200 to-pink-100 blur-3xl opacity-60" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/80 border border-[#e5e7eb] mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 910,000+ vetted creators ready to collab
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-[1.05]">
            Influencer marketing,{" "}
            <span className="brand-text">finally easy.</span>
          </h1>
          <p className="mt-5 text-lg text-[#374151] max-w-2xl mx-auto">
            Hire top Instagram, TikTok, YouTube, and UGC creators in minutes. Browse vetted talent, pay
            securely, and get content that actually converts.
          </p>

          <div className="mt-9 max-w-3xl mx-auto rounded-2xl bg-white border border-[#e5e7eb] shadow-xl p-3 sm:p-4 text-left">
            <FilterBar />
            <div className="flex items-center gap-2 mt-3">
              <input
                type="search"
                placeholder="Search by niche, name, or city…"
                className="flex-1 px-4 py-3 rounded-xl border border-[#e5e7eb] bg-[#f7f7fb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <Link
                href="/influencers"
                className="px-6 py-3 rounded-xl brand-gradient text-white font-semibold shadow-sm hover:opacity-95"
              >
                Search
              </Link>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c.label}
                href={`/influencers?category=${c.label}`}
                className="text-sm font-medium px-3.5 py-2 rounded-full bg-white border border-[#e5e7eb] hover:border-[#0b0b14]"
              >
                <span className="mr-1.5">{c.emoji}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Row title="Featured creators" subtitle="Hire top talent across every platform" href="/influencers" creators={featured} />
      <Row title="Instagram" subtitle="Hire Instagram influencers" href="/influencers?platform=instagram" creators={instagram} />
      <Row title="TikTok" subtitle="Hire TikTok influencers" href="/influencers?platform=tiktok" creators={tiktok} />
      <Row title="YouTube" subtitle="Hire YouTube creators" href="/influencers?platform=youtube" creators={youtube} />
      <Row title="UGC" subtitle="Buy user-generated content" href="/influencers?platform=ugc" creators={ugc} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Search for free", d: "Browse vetted creators with detailed audience analytics. No subscription, no contract." },
            { t: "Pay securely", d: "We hold your payment in escrow until you approve the final content. Stress-free." },
            { t: "Get content fast", d: "Receive ready-to-publish content directly in your dashboard, usually within days." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl p-6 border border-[#e5e7eb] bg-white">
              <div className="h-10 w-10 grid place-items-center rounded-xl brand-gradient text-white font-black mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-lg">{s.t}</h3>
              <p className="text-[#6b7280] mt-1.5 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="rounded-3xl p-10 md:p-14 brand-gradient text-white overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white/80 text-sm font-semibold">For brands</p>
              <h2 className="text-3xl md:text-4xl font-black mt-2 leading-tight">
                Post a campaign. Get 910,000+ creators to come to you.
              </h2>
              <p className="text-white/90 mt-3 max-w-md">
                Set your targeting, share your brief, and let matched creators apply with pricing. You pick who to work with.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/campaigns/new" className="px-5 py-3 rounded-xl bg-white text-[#0b0b14] font-bold hover:bg-white/90">
                  Post a campaign
                </Link>
                <Link href="/campaigns" className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">
                  Browse campaigns
                </Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Targeting", "Niche, location, follower size, age, gender"],
                ["Brief", "Centralize images, requirements, deliverables"],
                ["Applications", "Creators apply with their own pricing"],
                ["Tracking", "Real-time analytics across IG, TikTok, YouTube"],
              ].map(([t, d]) => (
                <li key={t} className="rounded-xl p-4 bg-white/10">
                  <p className="font-bold">{t}</p>
                  <p className="text-white/80 mt-1">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Layla", role: "Creator & founder", text: "Used the platform from both sides — by far the easiest way to connect with the right people." },
            { name: "Myriam", role: "Founder, BBeyond", text: "Best platform I've used. Signups everywhere else were noise. Real results came from here." },
            { name: "Courtney", role: "DTC marketer", text: "We generate seasonal content with creators here and save around 15 hours every month." },
          ].map((t) => (
            <blockquote key={t.name} className="rounded-2xl p-6 border border-[#e5e7eb] bg-white">
              <div className="text-amber-500 text-lg">★★★★★</div>
              <p className="mt-3 text-[#374151]">“{t.text}”</p>
              <footer className="mt-4 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-[#6b7280]">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-3xl font-black text-center">Common questions</h2>
        <div className="mt-8 divide-y divide-[#e5e7eb] rounded-2xl border border-[#e5e7eb] bg-white">
          {[
            ["What is influencer marketing?", "Partnering with creators who have engaged followings to promote your brand authentically. It works because recommendations from trusted voices land better than ads."],
            ["How do I find the right creators?", "Filter by niche, platform, location, audience size, and budget. Open profiles to see audience demographics and past work."],
            ["How much does it cost?", "Most bookings range from $50 for micro-creators to $5,000+ for established voices. Filter by price to match your budget."],
            ["How are payments protected?", "Funds are held in escrow and only released once you approve the deliverables. Disputes get a human review."],
          ].map(([q, a]) => (
            <details key={q} className="p-5 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {q}
                <span className="text-[#6b7280] group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-[#6b7280] mt-3 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <h2 className="text-4xl font-black">Find creators worth working with.</h2>
        <p className="text-[#6b7280] mt-3">Search Instagram, TikTok, YouTube, and UGC — all in one place.</p>
        <Link href="/influencers" className="inline-flex mt-6 px-6 py-3 rounded-xl brand-gradient text-white font-semibold shadow-sm hover:opacity-95">
          Search creators
        </Link>
      </section>
    </>
  );
}

function Row({
  title, subtitle, href, creators,
}: { title: string; subtitle: string; href: string; creators: Creator[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-[#6b7280] text-sm">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm font-semibold text-[#7c3aed] hover:underline whitespace-nowrap">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {creators.map((c) => (
          <CreatorCard key={c.username} c={c} />
        ))}
      </div>
    </section>
  );
}
