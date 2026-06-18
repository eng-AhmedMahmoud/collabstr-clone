import Link from "next/link";
import { CreatorCard } from "@/components/creator-card";
import { FilterBar } from "@/components/filter-bar";
import { CATEGORIES } from "@/lib/data";
import { serverApi } from "@/lib/api";
import type { ApiCreator } from "@/lib/types";

type ListResp = { total: number; page: number; pageSize: number; items: ApiCreator[] };

export const dynamic = "force-dynamic";

export default async function Home() {
  const api = await serverApi();
  let all: ApiCreator[] = [];
  try {
    const res = await api.get<ListResp>("/creators?pageSize=24");
    all = res.items;
  } catch {
    all = [];
  }
  const featured = all.slice(0, 8);
  const instagram = all.filter((c) => c.platforms.includes("instagram")).slice(0, 4);
  const tiktok = all.filter((c) => c.platforms.includes("tiktok")).slice(0, 4);
  const youtube = all.filter((c) => c.platforms.includes("youtube")).slice(0, 4);
  const ugc = all.filter((c) => c.platforms.includes("ugc") || c.badges.includes("UGC")).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 brand-gradient-soft opacity-90" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-200 via-brand-100 to-amber-100 blur-3xl opacity-70 dark:opacity-30" />
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 blur-3xl opacity-60 dark:opacity-25" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-elevated/80 border border-border mb-5">
            <span className="text-base leading-none">🇸🇦</span>
            Made in KSA · 910,000+ صانع محتوى موثوق
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-[1.05]">
            تسويق المؤثرين في المملكة،{" "}
            <span className="brand-text">أسهل من أي وقت.</span>
          </h1>
          <p className="mt-3 text-base text-fg/70 max-w-2xl mx-auto">
            Influencer marketing for Saudi Arabia — finally easy.
          </p>
          <p className="mt-5 text-lg text-fg/80 max-w-2xl mx-auto">
            Hire top KSA creators on Instagram, TikTok, Snapchat, YouTube, and UGC. Browse vetted Saudi talent,
            pay securely in SAR (ر.س), and ship content that converts in Riyadh, Jeddah, Dammam, and beyond.
          </p>

          <form action="/influencers" className="mt-9 max-w-3xl mx-auto rounded-2xl bg-elevated border border-border shadow-xl p-3 sm:p-4 text-left">
            <FilterBar />
            <div className="flex items-center gap-2 mt-3">
              <input
                type="search"
                name="q"
                placeholder="ابحث عن مؤثر، تخصص، أو مدينة… / Search niche, name, or city"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface focus:bg-elevated focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button type="submit" className="px-6 py-3 rounded-xl brand-gradient text-white font-semibold shadow-sm hover:opacity-95">
                بحث · Search
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c.label}
                href={`/influencers?category=${c.label}`}
                className="text-sm font-medium px-3.5 py-2 rounded-full bg-elevated border border-border hover:border-fg"
              >
                <span className="mr-1.5">{c.emoji}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 text-center">
          <p className="text-muted">
            API isn&apos;t reachable. Start the API with <code className="bg-surface px-2 py-1 rounded">pnpm api dev</code> (and Postgres via <code className="bg-surface px-2 py-1 rounded">docker compose up -d</code>), then refresh.
          </p>
        </section>
      ) : (
        <>
          <Row title="Featured creators" subtitle="Hire top talent across every platform" href="/influencers" creators={featured} />
          {instagram.length > 0 && <Row title="Instagram" subtitle="Hire Instagram influencers" href="/influencers?platform=instagram" creators={instagram} />}
          {tiktok.length > 0 && <Row title="TikTok" subtitle="Hire TikTok influencers" href="/influencers?platform=tiktok" creators={tiktok} />}
          {youtube.length > 0 && <Row title="YouTube" subtitle="Hire YouTube creators" href="/influencers?platform=youtube" creators={youtube} />}
          {ugc.length > 0 && <Row title="UGC" subtitle="Buy user-generated content" href="/influencers?platform=ugc" creators={ugc} />}
        </>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "ابحث مجاناً · Browse for free", d: "Filter vetted KSA creators by niche, city (Riyadh, Jeddah, Dammam, Khobar), and audience demographics. No subscription." },
            { t: "ادفع بأمان بالريال · Pay safely in SAR", d: "Funds held in escrow and released only on approval. Mada, Apple Pay, and bank transfer ready." },
            { t: "محتوى سريع · Get content fast", d: "Receive ready-to-publish content shaped for Saudi audiences directly in your dashboard." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl p-6 border border-border bg-elevated">
              <div className="h-10 w-10 grid place-items-center rounded-xl brand-gradient text-white font-black mb-4">{i + 1}</div>
              <h3 className="font-bold text-lg">{s.t}</h3>
              <p className="text-muted mt-1.5 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="rounded-3xl p-10 md:p-14 brand-gradient text-white overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white/80 text-sm font-semibold">For brands · للعلامات التجارية</p>
              <h2 className="text-3xl md:text-4xl font-black mt-2 leading-tight">انشر حملتك. دع المؤثرين يتقدمون إليك.</h2>
              <p className="text-white/90 mt-3 max-w-md">Set KSA-region targeting, share your brief in Arabic or English, and let matched Saudi creators apply with SAR pricing. You pick.</p>
              <div className="mt-6 flex gap-3">
                <Link href="/campaigns/new" className="px-5 py-3 rounded-xl bg-elevated text-fg font-bold hover:bg-white/90">Post a campaign</Link>
                <Link href="/campaigns" className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Browse campaigns</Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Targeting", "Niche, KSA city, follower size, age, gender"],
                ["Brief", "Arabic/English copy, deliverables, deadlines"],
                ["Applications", "Saudi creators apply with SAR pricing"],
                ["Tracking", "Real-time analytics across IG, TikTok, Snap"],
              ].map(([t, d]) => (
                <li key={t} className="rounded-xl p-4 bg-white/10"><p className="font-bold">{t}</p><p className="text-white/80 mt-1">{d}</p></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-3xl font-black text-center">Common questions</h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-elevated">
          {[
            ["ما هو تسويق المؤثرين؟ · What is influencer marketing?", "Partnering with Saudi creators who have engaged local followings to promote your brand authentically across the Kingdom."],
            ["How do I find the right creators in KSA?", "Filter by niche, platform, Saudi city (الرياض، جدة، الدمام، الخبر), audience size, and budget. Open profiles for full audience demographics."],
            ["How much does a campaign cost?", "Most bookings range from 200 ر.س for micro-creators up to 20,000+ ر.س for top KSA voices. You set the budget."],
            ["كيف تتم حماية الدفع؟ · How are payments protected?", "All funds held in SAR escrow and released only after you approve. Disputes get human review within 48 hours."],
          ].map(([q, a]) => (
            <details key={q} className="p-5 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">{q}<span className="text-muted group-open:rotate-45 transition">+</span></summary>
              <p className="text-muted mt-3 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <h2 className="text-4xl font-black">اعثر على مؤثرين يستحقون التعاون.</h2>
        <p className="mt-2 text-lg font-semibold text-fg/80">Find KSA creators worth working with.</p>
        <p className="text-muted mt-3">Instagram · TikTok · Snapchat · YouTube · UGC — all in one Saudi platform.</p>
        <Link href="/influencers" className="inline-flex mt-6 px-6 py-3 rounded-xl brand-gradient text-white font-semibold shadow-sm hover:opacity-95">ابحث الآن · Search creators</Link>
      </section>
    </>
  );
}

function Row({ title, subtitle, href, creators }: { title: string; subtitle: string; href: string; creators: ApiCreator[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-muted text-sm">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm font-semibold text-brand hover:underline whitespace-nowrap">See all →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {creators.map((c) => <CreatorCard key={c.username} c={c} />)}
      </div>
    </section>
  );
}
