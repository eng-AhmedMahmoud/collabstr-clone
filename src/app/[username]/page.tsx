import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { findCreator, CREATORS } from "@/lib/data";
import { fmtFollowers, fmtMoney } from "@/lib/format";

export function generateStaticParams() {
  return CREATORS.map((c) => ({ username: c.username }));
}

export default async function CreatorProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const c = findCreator(username);
  if (!c) notFound();

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-[#f3f4f6]">
              <Image src={c.cover} alt={c.name} fill className="object-cover" priority />
            </div>
            <div className="flex items-end gap-4 -mt-12 px-4">
              <div className="relative h-24 w-24 rounded-2xl ring-4 ring-white bg-white overflow-hidden shrink-0">
                <Image src={c.avatar} alt={c.name} fill className="object-cover" />
              </div>
              <div className="pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7c3aed]">
                  {c.headline}
                </p>
                <h1 className="text-3xl font-black">{c.name}</h1>
                <div className="text-sm text-[#6b7280] mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    ★ <span className="text-[#0b0b14]">{c.rating.toFixed(1)}</span>
                    <span className="text-[#6b7280] font-normal">· {c.reviewsCount} reviews</span>
                  </span>
                  <span>·</span>
                  <span>{c.city}, {c.country}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-2 pb-2">
                <button className="px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm font-medium hover:bg-[#f7f7fb]">Share</button>
                <button className="px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm font-medium hover:bg-[#f7f7fb]">Save</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["instagram","tiktok","youtube"] as const).map((p) => (
              <div key={p} className="rounded-xl border border-[#e5e7eb] bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">{p}</p>
                <p className="text-2xl font-black mt-1">{fmtFollowers(c.followers[p])}</p>
                <p className="text-xs text-[#6b7280]">followers</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-xl font-black mb-3">About {c.name.split(" ")[0]}</h2>
            <p className="text-[#374151] leading-relaxed">{c.bio}</p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-3">Portfolio</h2>
            <div className="grid grid-cols-3 gap-2">
              {c.portfolio.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f3f4f6]">
                  <Image src={src} alt="" fill className="object-cover" sizes="33vw" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
            <h2 className="text-xl font-black mb-4">Audience analytics</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Stat label="Followers" value={fmtFollowers(
                (c.followers.instagram ?? 0) + (c.followers.tiktok ?? 0) + (c.followers.youtube ?? 0)
              )} />
              <Stat label="Average views" value={fmtFollowers(c.audience.avgViews)} />
              <Stat label="Engagement" value={`${c.audience.engagement}%`} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-sm mb-3">Audience location</h3>
                <ul className="space-y-2 text-sm">
                  {c.audience.locations.map((l) => (
                    <li key={l.code} className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span className="flex-1">{l.code}</span>
                      <div className="w-24 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full brand-gradient" style={{ width: `${l.pct}%` }} />
                      </div>
                      <span className="text-[#6b7280] w-8 text-right">{l.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-3">Audience age</h3>
                <ul className="space-y-2 text-sm">
                  {c.audience.ages.map((a) => (
                    <li key={a.range} className="flex items-center gap-2">
                      <span className="w-12">{a.range}</span>
                      <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full brand-gradient" style={{ width: `${a.pct}%` }} />
                      </div>
                      <span className="text-[#6b7280] w-8 text-right">{a.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-3">Audience gender</h3>
                <div className="rounded-lg overflow-hidden flex h-6 mt-2">
                  <div className="brand-gradient grid place-items-center text-white text-xs font-semibold" style={{ width: `${c.audience.gender.female}%` }}>
                    {c.audience.gender.female}%
                  </div>
                  <div className="bg-[#0b0b14] grid place-items-center text-white text-xs font-semibold" style={{ width: `${c.audience.gender.male}%` }}>
                    {c.audience.gender.male}%
                  </div>
                </div>
                <p className="text-xs text-[#6b7280] mt-2">Female / Male</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
            <h2 className="text-xl font-black mb-4">Reviews ({c.reviewsCount})</h2>
            <ul className="space-y-5">
              {c.reviews.map((r, i) => (
                <li key={i} className="border-b last:border-0 border-[#e5e7eb] pb-5 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.brand}</p>
                    <p className="text-xs text-[#6b7280]">{r.date}</p>
                  </div>
                  <p className="text-amber-500 text-sm">{"★".repeat(Math.round(r.rating))}</p>
                  <p className="text-[#374151] mt-1.5 text-sm">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6b7280]">From</p>
            <p className="text-3xl font-black">{fmtMoney(c.startingPrice)}</p>

            <ul className="mt-5 space-y-2">
              {c.packages.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e7eb] p-3 hover:border-[#0b0b14] cursor-pointer">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="text-sm font-bold">{fmtMoney(p.price)}</span>
                </li>
              ))}
            </ul>

            <Link href="/checkout" className="mt-5 w-full inline-flex justify-center px-4 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95">
              Add to cart
            </Link>
            <Link href="/messages" className="mt-2 w-full inline-flex justify-center px-4 py-3 rounded-xl border border-[#0b0b14] text-[#0b0b14] font-bold hover:bg-[#f7f7fb]">
              Negotiate a package
            </Link>

            <ul className="mt-5 space-y-2 text-xs text-[#6b7280]">
              <li>✓ Funds held in escrow until you approve</li>
              <li>✓ Average delivery: 5 days</li>
              <li>✓ Free revisions on every package</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f7fb] p-4">
      <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
