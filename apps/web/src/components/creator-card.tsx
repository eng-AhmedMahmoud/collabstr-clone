import Link from "next/link";
import Image from "next/image";
import type { ApiCreator } from "@/lib/types";
import { fmtFollowers, fmtMoney } from "@/lib/format";

export function CreatorCard({ c }: { c: ApiCreator }) {
  const followCount = c.followersIg ?? c.followersTt ?? c.followersYt ?? 0;
  const cover = c.coverUrl || `https://picsum.photos/seed/${c.username}/600/750`;
  return (
    <Link
      href={`/${c.username}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-[#e5e7eb] hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f4f6]">
        <Image
          src={cover}
          alt={c.user.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover group-hover:scale-[1.03] transition duration-500"
        />
        <div className="absolute inset-x-0 top-0 p-3 flex gap-1.5 flex-wrap">
          {c.badges.map((b) => (
            <span
              key={b}
              className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/95 text-[#0b0b14] shadow-sm"
            >
              {b}
            </span>
          ))}
          {followCount >= 1000 && (
            <span className="ml-auto text-[11px] font-bold px-2 py-1 rounded-full bg-black/70 text-white">
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
            <div className="text-right">
              <p className="text-[11px] text-white/80">from</p>
              <p className="text-sm font-extrabold">{fmtMoney(c.startingPrice)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-[#6b7280]">{c.city}</span>
        <span className="flex items-center gap-1 font-semibold">
          <span className="text-amber-500">★</span>
          {c.rating.toFixed(1)}
          <span className="text-[#6b7280] font-normal">({c.reviewsCount})</span>
        </span>
      </div>
    </Link>
  );
}
