import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import { fmtFollowers, fmtMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { ApiCreator } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CreatorProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const i = await t();
  const { username } = await params;
  const api = await serverApi();
  let c: ApiCreator;
  try {
    c = await api.get<ApiCreator>(`/creators/by-username/${encodeURIComponent(username)}`);
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }

  const cover = c.coverUrl || `https://picsum.photos/seed/${c.username}/1200/600`;
  const avatar = c.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(c.username)}`;

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-surface">
              <Image src={cover} alt={c.user.name} fill className="object-cover" priority />
            </div>
            <div className="flex items-end gap-4 -mt-12 px-4">
              <div className="relative h-24 w-24 rounded-2xl ring-4 ring-white bg-elevated overflow-hidden shrink-0">
                <Image src={avatar} alt={c.user.name} fill className="object-cover" />
              </div>
              <div className="pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{c.headline}</p>
                <h1 className="text-3xl font-black">{c.user.name}</h1>
                <div className="text-sm text-muted mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    ★ <span className="text-fg">{c.rating.toFixed(1)}</span>
                    <span className="text-muted font-normal">· {c.reviewsCount} {i.profile.reviewsTitle.toLowerCase()}</span>
                  </span>
                  <span>·</span>
                  <span>{c.city}, {c.country}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-2 pb-2">
                <button className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface">{i.profile.shareLabel}</button>
                <form action={`/api/save/${c.id}`} method="post">
                  <button className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface">{i.profile.saveLabel}</button>
                </form>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {([["instagram", c.followersIg], ["tiktok", c.followersTt], ["youtube", c.followersYt]] as const).map(([p, f]) => (
              <div key={p} className="rounded-xl border border-border bg-elevated p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{p}</p>
                <p className="text-2xl font-black mt-1">{fmtFollowers(f ?? undefined)}</p>
                <p className="text-xs text-muted">{i.profile.followers}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-xl font-black mb-3">{i.profile.aboutPrefix} {c.user.name.split(" ")[0]}</h2>
            <p className="text-fg/80 leading-relaxed">{c.bio}</p>
          </section>

          {c.portfolio.length > 0 && (
            <section>
              <h2 className="text-xl font-black mb-3">{i.profile.portfolio}</h2>
              <div className="grid grid-cols-3 gap-2">
                {c.portfolio.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-surface">
                    <Image src={src} alt="" fill className="object-cover" sizes="33vw" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.audience && (
            <section className="rounded-2xl border border-border bg-elevated p-6">
              <h2 className="text-xl font-black mb-4">{i.profile.audienceTitle}</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <Stat label={i.profile.audienceFollowers} value={fmtFollowers(
                  (c.followersIg ?? 0) + (c.followersTt ?? 0) + (c.followersYt ?? 0)
                )} />
                <Stat label={i.profile.audienceAvgViews} value={fmtFollowers(c.avgViews ?? undefined)} />
                <Stat label={i.profile.audienceEngagement} value={`${c.engagement ?? "—"}%`} />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-sm mb-3">{i.profile.audienceLocation}</h3>
                  <ul className="space-y-2 text-sm">
                    {c.audience.locations.map((l) => (
                      <li key={l.code} className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span className="flex-1">{l.code}</span>
                        <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className="h-full brand-gradient" style={{ width: `${l.pct}%` }} />
                        </div>
                        <span className="text-muted w-8 text-right">{l.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-3">{i.profile.audienceAge}</h3>
                  <ul className="space-y-2 text-sm">
                    {c.audience.ages.map((a) => (
                      <li key={a.range} className="flex items-center gap-2">
                        <span className="w-12">{a.range}</span>
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className="h-full brand-gradient" style={{ width: `${a.pct}%` }} />
                        </div>
                        <span className="text-muted w-8 text-right">{a.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-3">{i.profile.audienceGender}</h3>
                  <div className="rounded-lg overflow-hidden flex h-6 mt-2">
                    <div className="brand-gradient grid place-items-center text-white text-xs font-semibold" style={{ width: `${c.audience.gender.female}%` }}>
                      {c.audience.gender.female}%
                    </div>
                    <div className="bg-fg grid place-items-center text-bg text-xs font-semibold" style={{ width: `${c.audience.gender.male}%` }}>
                      {c.audience.gender.male}%
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-2">{i.profile.genderLegend}</p>
                </div>
              </div>
            </section>
          )}

          {c.reviewsReceived && c.reviewsReceived.length > 0 && (
            <section className="rounded-2xl border border-border bg-elevated p-6">
              <h2 className="text-xl font-black mb-4">{i.profile.reviewsTitle} ({c.reviewsCount})</h2>
              <ul className="space-y-5">
                {c.reviewsReceived.map((r) => (
                  <li key={r.id} className="border-b last:border-0 border-border pb-5 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{r.author.name}</p>
                      <p className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("en-SA", { timeZone: "Asia/Riyadh" })}</p>
                    </div>
                    <p className="text-amber-500 text-sm">{"★".repeat(Math.round(r.rating))}</p>
                    <p className="text-fg/80 mt-1.5 text-sm">{r.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-border bg-elevated p-5 shadow-sm">
            <p className="text-sm text-muted">{i.profile.from}</p>
            <p className="text-3xl font-black">{fmtMoney(c.startingPrice)}</p>

            <ul className="mt-5 space-y-2">
              {c.packages?.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:border-fg cursor-pointer">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="text-sm font-bold">{fmtMoney(p.price)}</span>
                </li>
              ))}
            </ul>

            <Link href={`/checkout?creator=${c.username}&package=${c.packages?.[0]?.id ?? ""}`} className="mt-5 w-full inline-flex justify-center px-4 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95">
              {i.profile.addToCart}
            </Link>
            <Link href={`/messages?to=${c.username}`} className="mt-2 w-full inline-flex justify-center px-4 py-3 rounded-xl border border-fg text-fg font-bold hover:bg-surface">
              {i.profile.negotiate}
            </Link>

            <ul className="mt-5 space-y-2 text-xs text-muted">
              <li>✓ {i.profile.escrow}</li>
              <li>✓ {i.profile.delivery}</li>
              <li>✓ {i.profile.revisions}</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
