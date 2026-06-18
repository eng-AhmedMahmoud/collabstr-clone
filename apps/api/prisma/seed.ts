import { PrismaClient, Platform, Category } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Seed = {
  username: string;
  name: string;
  email: string;
  headline: string;
  city: string;
  country: string;
  platforms: Platform[];
  categories: Category[];
  followers: { ig?: number; tt?: number; yt?: number };
  startingPrice: number;
  badges: string[];
  cover: string;
};

const SEEDS: Seed[] = [
  { username: "ava.luxe", name: "Ava Lux", email: "ava@example.dev", headline: "Fashion & lifestyle storyteller", city: "Brooklyn, NY", country: "US", platforms: ["instagram","tiktok"], categories: ["Fashion","Lifestyle"], followers: { ig: 248000, tt: 180000 }, startingPrice: 320, badges: ["Top Creator","Responds Fast"], cover: "https://picsum.photos/seed/ava.luxe/1200/600" },
  { username: "milo.creates", name: "Milo Park", email: "milo@example.dev", headline: "UGC for DTC brands that convert", city: "Austin, TX", country: "US", platforms: ["ugc","tiktok"], categories: ["Tech","Lifestyle"], followers: { tt: 42000 }, startingPrice: 150, badges: ["UGC","Responds Fast"], cover: "https://picsum.photos/seed/milo.creates/1200/600" },
  { username: "sage.kim", name: "Sage Kim", email: "sage@example.dev", headline: "Beauty creator & licensed esthetician", city: "Los Angeles, CA", country: "US", platforms: ["instagram","youtube"], categories: ["Beauty","Lifestyle"], followers: { ig: 612000, yt: 84000 }, startingPrice: 850, badges: ["Top Creator"], cover: "https://picsum.photos/seed/sage.kim/1200/600" },
  { username: "travis.roams", name: "Travis Hale", email: "travis@example.dev", headline: "Adventure travel cinematographer", city: "Denver, CO", country: "US", platforms: ["youtube","instagram"], categories: ["Travel","Lifestyle"], followers: { yt: 320000, ig: 96000 }, startingPrice: 1200, badges: ["Top Creator","Responds Fast"], cover: "https://picsum.photos/seed/travis.roams/1200/600" },
  { username: "nora.fit", name: "Nora Ellis", email: "nora@example.dev", headline: "Strength coach & nutrition tips", city: "Toronto, ON", country: "CA", platforms: ["instagram","tiktok"], categories: ["Fitness","Lifestyle"], followers: { ig: 88000, tt: 210000 }, startingPrice: 220, badges: ["Responds Fast"], cover: "https://picsum.photos/seed/nora.fit/1200/600" },
  { username: "kenji.eats", name: "Kenji Sato", email: "kenji@example.dev", headline: "Tokyo food explorer", city: "Tokyo", country: "JP", platforms: ["tiktok","youtube"], categories: ["Food","Travel"], followers: { tt: 1100000, yt: 240000 }, startingPrice: 1800, badges: ["Top Creator"], cover: "https://picsum.photos/seed/kenji.eats/1200/600" },
  { username: "lulu.kids", name: "Lulu Marin", email: "lulu@example.dev", headline: "Family vlogger, mom of three", city: "Phoenix, AZ", country: "US", platforms: ["instagram","youtube"], categories: ["Family","Lifestyle"], followers: { ig: 156000, yt: 72000 }, startingPrice: 480, badges: ["Top Creator","Responds Fast"], cover: "https://picsum.photos/seed/lulu.kids/1200/600" },
  { username: "riot.plays", name: "Rio Tanaka", email: "rio@example.dev", headline: "Gaming + tech reviews", city: "London", country: "GB", platforms: ["youtube","tiktok"], categories: ["Gaming","Tech"], followers: { yt: 410000, tt: 88000 }, startingPrice: 950, badges: [], cover: "https://picsum.photos/seed/riot.plays/1200/600" },
];

async function main() {
  console.log("Seeding…");

  const brandHash = await bcrypt.hash("Password123!", 11);
  const brand = await prisma.user.upsert({
    where: { email: "brand@example.dev" },
    update: {},
    create: {
      email: "brand@example.dev",
      name: "Wildbloom Co.",
      role: "brand",
      passwordHash: brandHash,
      brandProfile: { create: { brandName: "Wildbloom Co." } },
    },
  });

  for (const s of SEEDS) {
    const passwordHash = await bcrypt.hash("Password123!", 11);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        name: s.name,
        role: "creator",
        passwordHash,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(s.username)}`,
      },
    });
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        username: s.username,
        headline: s.headline,
        bio: `${s.headline}. Working with brands across ${s.categories.slice(0,2).join(" and ")} to create thumb-stopping content that converts.`,
        city: s.city,
        country: s.country,
        coverUrl: s.cover,
        startingPrice: s.startingPrice,
        platforms: s.platforms,
        categories: s.categories,
        badges: s.badges,
        followersIg: s.followers.ig,
        followersTt: s.followers.tt,
        followersYt: s.followers.yt,
        avgViews: Math.round((s.followers.ig ?? s.followers.tt ?? s.followers.yt ?? 5000) * 0.18),
        engagement: Math.round((Math.random() * 4 + 2) * 10) / 10,
        portfolio: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/${s.username}-${i}/600/600`),
        audience: {
          locations: [
            { code: "US", flag: "🇺🇸", pct: 58 },
            { code: "GB", flag: "🇬🇧", pct: 14 },
            { code: "CA", flag: "🇨🇦", pct: 10 },
            { code: "AU", flag: "🇦🇺", pct: 8 },
          ],
          ages: [
            { range: "13-17", pct: 8 },
            { range: "18-24", pct: 46 },
            { range: "25-34", pct: 32 },
            { range: "35-44", pct: 10 },
            { range: "45+", pct: 4 },
          ],
          gender: { female: 64, male: 36 },
        },
      },
    });
    const existingPkgs = await prisma.package.count({ where: { creatorId: profile.id } });
    if (existingPkgs === 0) {
      await prisma.package.createMany({
        data: [
          { creatorId: profile.id, title: `1 ${s.platforms[0].toUpperCase()} Post`, price: s.startingPrice },
          { creatorId: profile.id, title: `1 ${s.platforms[0].toUpperCase()} Story`, price: Math.round(s.startingPrice * 0.6) },
          { creatorId: profile.id, title: `Bundle: 3 Posts + 5 Stories`, price: Math.round(s.startingPrice * 3.2) },
        ],
      });
    }
  }

  const camps = await prisma.campaign.count({ where: { brandId: brand.id } });
  if (camps === 0) {
    await prisma.campaign.createMany({
      data: [
        {
          brandId: brand.id,
          title: "Spring drop — sustainable activewear",
          description: "Looking for creators to film an honest review of our new spring activewear line. Focus on fit, fabric feel, and movement.",
          budgetMin: 200, budgetMax: 1200,
          platforms: ["instagram", "tiktok"],
          categories: ["Fashion", "Fitness"],
          creatorsNeeded: 10,
        },
        {
          brandId: brand.id,
          title: "Cold brew launch — UGC for paid ads",
          description: "Need 30 UGC videos in vertical format showcasing our cold brew bottles. Morning routine angle preferred.",
          budgetMin: 150, budgetMax: 500,
          platforms: ["ugc", "tiktok"],
          categories: ["Food", "Lifestyle"],
          creatorsNeeded: 30,
        },
      ],
    });
  }

  console.log("Seed done. Brand login: brand@example.dev / Password123!");
  console.log("Creator example: ava@example.dev / Password123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
