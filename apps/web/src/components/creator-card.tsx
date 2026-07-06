import Link from "next/link";
import Image from "next/image";
import type { ApiCreator } from "@/lib/types";
import { fmtFollowers } from "@/lib/format";
import { t, getLocale } from "@/lib/i18n";
import { Money } from "@/components/money";

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export async function CreatorCard({ c }: { c: ApiCreator }) {
  const i = await t();
  const locale = await getLocale();
  const moneyLocale = locale === "ar" ? "ar-SA" : "en-SA";
  const followCount = c.followersIg ?? c.followersTt ?? c.followersYt ?? 0;
  const cover = c.coverUrl || `https://picsum.photos/seed/${c.username}/600/750`;
  const labelBadge = (b: string) =>
    i.badgeLabels[b as keyof typeof i.badgeLabels] ?? b;
  const fromLabel = locale === "ar" ? "من" : "from";
  return (
    <Link
      href={`/${c.username}`}
      className="group block rounded-2xl overflow-hidden bg-elevated border border-border hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden brand-mesh"
        style={{
          // Deterministic per-creator gradient — renders even if cover image
          // 404s or the CDN is slow. Uses a stable hash of the username so
          // each creator has a consistent identity colour.
          backgroundImage: `linear-gradient(135deg, hsl(${hashHue(c.username)} 70% 38%) 0%, hsl(${(hashHue(c.username) + 60) % 360} 70% 55%) 100%)`,
        }}
      >
        <Image
          src={cover}
          alt={c.user.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover group-hover:scale-[1.03] transition duration-500"
          unoptimized
        />
        <div className="absolute inset-x-0 top-0 p-3 flex gap-1.5 flex-wrap">
          {c.mawthooqStatus === "verified" && (
            <span
              title={i.mawthooq.badgeFull}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-brand text-white shadow-sm"
            >
              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 1.5l2.09 1.52 2.58-.02.79 2.45 2.09 1.5-.8 2.45.8 2.45-2.09 1.5-.79 2.45-2.58-.02L10 18.5l-2.09-1.52-2.58.02-.79-2.45L2.45 13l.8-2.45-.8-2.45 2.09-1.5.79-2.45 2.58.02L10 1.5zm3.03 6.24a.75.75 0 00-1.06-1.06L9 9.65 7.53 8.18a.75.75 0 10-1.06 1.06l2 2a.75.75 0 001.06 0l3.5-3.5z" clipRule="evenodd" />
              </svg>
              {i.mawthooq.badge}
            </span>
          )}
          {c.badges.map((b) => (
            <span
              key={b}
              className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/95 text-zinc-900 shadow-sm"
            >
              {labelBadge(b)}
            </span>
          ))}
          {followCount >= 1000 && (
            <span className="ms-auto text-[11px] font-bold px-2 py-1 rounded-full bg-black/70 text-white">
              {fmtFollowers(followCount)}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold leading-tight">{c.user.name}</p>
              <p className="text-[11px] text-white/80 line-clamp-1">{c.headline}</p>
            </div>
            <div className="text-end">
              <p className="text-[11px] text-white/80">{fromLabel}</p>
              <Money value={c.startingPrice} locale={moneyLocale} className="text-sm font-extrabold" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-muted">{c.city}</span>
        <span className="flex items-center gap-1 font-semibold">
          <span className="text-amber-500">★</span>
          {c.rating.toFixed(1)}
          <span className="text-muted font-normal">({c.reviewsCount})</span>
        </span>
      </div>
    </Link>
  );
}
