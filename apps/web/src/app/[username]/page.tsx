import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { fmtFollowers } from "@/lib/format";
import { t, getLocale } from "@/lib/i18n";
import { Money } from "@/components/money";
import type { ApiCreator } from "@/lib/types";
import { SaveButton, ShareButton } from "./save-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  try {
    const api = await serverApi();
    const c = await api.get<ApiCreator>(`/creators/by-username/${encodeURIComponent(username)}`);
    return {
      title: `${c.user.name} — ${c.headline} | Nakhla`,
      description: c.bio?.slice(0, 160),
    };
  } catch {
    return { title: "Creator — Nakhla" };
  }
}

export default async function CreatorProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const i = await t();
  const locale = await getLocale();
  const moneyLocale = locale === "ar" ? "ar-SA" : "en-SA";
  const { username } = await params;
  const me = await getSession();
  const api = await serverApi();
  let c: ApiCreator;
  try {
    c = await api.get<ApiCreator>(`/creators/by-username/${encodeURIComponent(username)}`);
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }

  // Resolve the viewer's saved state server-side so the Save button reflects
  // reality on first paint (not always "Save"). saved rows embed the creator
  // profile, so match on its id (same id used by the POST /:creatorId/save).
  let savedInitial = false;
  if (me) {
    try {
      const saved = await api.get<{ creator: { id: string } }[]>("/creators/me/saved");
      savedInitial = saved.some((s) => s.creator?.id === c.id);
    } catch {
      // Not fatal — default to "not saved".
    }
  }

  const cover = c.coverUrl || `https://picsum.photos/seed/${c.username}/1200/600`;
  const avatar = c.user.avatarUrl || `https://i.pravatar.cc/300?u=${encodeURIComponent(c.username)}`;

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-surface">
              <Image src={cover} alt={c.user.name} fill className="object-cover" priority />
            </div>
            <div className="flex items-end gap-4 px-4">
              <div className="relative h-24 w-24 -mt-12 rounded-2xl ring-4 ring-white dark:ring-elevated bg-elevated overflow-hidden shrink-0">
                <Image src={avatar} alt={c.user.name} fill className="object-cover" unoptimized />
              </div>
              <div className="min-w-0 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{c.headline}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-black">{c.user.name}</h1>
                  {c.mawthooqStatus === "verified" && (
                    <span
                      title={i.mawthooq.badgeFull}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-brand text-white"
                    >
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 1.5l2.09 1.52 2.58-.02.79 2.45 2.09 1.5-.8 2.45.8 2.45-2.09 1.5-.79 2.45-2.58-.02L10 18.5l-2.09-1.52-2.58.02-.79-2.45L2.45 13l.8-2.45-.8-2.45 2.09-1.5.79-2.45 2.58.02L10 1.5zm3.03 6.24a.75.75 0 00-1.06-1.06L9 9.65 7.53 8.18a.75.75 0 10-1.06 1.06l2 2a.75.75 0 001.06 0l3.5-3.5z" clipRule="evenodd" />
                      </svg>
                      {i.mawthooq.badge}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    ★ <span className="text-fg">{c.rating.toFixed(1)}</span>
                    <span className="text-muted font-normal">· {c.reviewsCount} {i.profile.reviewsTitle.toLowerCase()}</span>
                  </span>
                  <span>·</span>
                  <span>{c.city}, {c.country}</span>
                </div>
              </div>
              <div className="ms-auto flex gap-2 pb-2">
                <ShareButton username={c.username} name={c.user.name} />
                <SaveButton creatorId={c.id} username={c.username} loggedIn={!!me} saved={savedInitial} />
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
                        <span className="text-muted w-8 text-end">{l.pct}%</span>
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
                        <span className="text-muted w-8 text-end">{a.pct}%</span>
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
            <p className="text-3xl font-black"><Money value={c.startingPrice} locale={moneyLocale} /></p>

            <ul className="mt-5 space-y-2">
              {c.packages?.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/checkout?creator=${encodeURIComponent(c.username)}&package=${encodeURIComponent(p.id)}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:border-fg"
                  >
                    <span className="text-sm font-medium">{p.title}</span>
                    <Money value={p.price} locale={moneyLocale} className="text-sm font-bold" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link href={`/checkout?creator=${encodeURIComponent(c.username)}&package=${encodeURIComponent(c.packages?.[0]?.id ?? "")}`} className="mt-5 w-full inline-flex justify-center px-4 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95">
              {i.profile.bookNow}
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
