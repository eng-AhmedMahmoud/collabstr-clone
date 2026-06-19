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

// KSA creator roster modeled after real, top-tier Saudi influencers.
// Handles + niches + tiers sourced from public 2026 influencer rankings
// (Feedspot, HypeAuditor, IstiZada). Prices SAR. Demo data — emails/profiles
// are not real contact info.
const SEEDS: Seed[] = [
  { username: "barmz.alhajjaj", name: "Ibrahim Al-Hajjaj · إبراهيم الحجاج", email: "barmz@example.dev", headline: "ممثل · ستاندآب كوميديان · House of Comedy", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","youtube"], categories: ["Comedy","Lifestyle"], followers: { ig: 6400000, yt: 1200000 }, startingPrice: 14000, badges: ["Top Creator","Verified"], cover: "https://picsum.photos/seed/barmz.alhajjaj/1200/600" },
  { username: "misho.baeshen", name: "Hisham Baeshen · هشام باعشن", email: "misho@example.dev", headline: "Chef · شيف صانع محتوى · @bajmrah @figlbak", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","tiktok"], categories: ["Food","Lifestyle"], followers: { ig: 5000000, tt: 1800000 }, startingPrice: 12000, badges: ["Top Creator","Verified"], cover: "https://picsum.photos/seed/misho.baeshen/1200/600" },
  { username: "nouf.fashion", name: "Nouf Alshalan · نوف الشعلان", email: "nouf@example.dev", headline: "Fashion & Beauty · صانعة محتوى أزياء", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","tiktok"], categories: ["Fashion","Beauty"], followers: { ig: 3800000, tt: 920000 }, startingPrice: 9500, badges: ["Top Creator"], cover: "https://picsum.photos/seed/nouf.fashion/1200/600" },
  { username: "emad.anwer", name: "Emad Anwer · عماد أنور", email: "emad@example.dev", headline: "English coach · مدرّب لغة إنجليزية على أبواب", city: "Jeddah · جدة", country: "SA", platforms: ["instagram","tiktok"], categories: ["Lifestyle"], followers: { ig: 4100000, tt: 760000 }, startingPrice: 9000, badges: ["Top Creator"], cover: "https://picsum.photos/seed/emad.anwer/1200/600" },
  { username: "bashar.arabi", name: "Bashar Arabi · بشار عربي", email: "bashar@example.dev", headline: "Football athlete · أكبر قناة رياضية في MENA", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","tiktok"], categories: ["Fitness","Lifestyle"], followers: { ig: 2300000, tt: 1500000 }, startingPrice: 7500, badges: ["Top Creator","Verified"], cover: "https://picsum.photos/seed/bashar.arabi/1200/600" },
  { username: "opiilz", name: "Saleh Alzahrani · صالح الزهراني", email: "saleh@example.dev", headline: "Gamer · Vlogger · 10M على YouTube · @teamfalconsgg", city: "Dammam · الدمام", country: "SA", platforms: ["youtube","instagram"], categories: ["Gaming","Tech"], followers: { yt: 10000000, ig: 1100000 }, startingPrice: 6800, badges: ["Top Creator","Verified"], cover: "https://picsum.photos/seed/opiilz/1200/600" },
  { username: "doaa.alhothefy", name: "Doaa Alhothefy · دعاء الحذيفي", email: "doaa@example.dev", headline: "Co-Founder GetSmart · Style @doaacloset", city: "Jeddah · جدة", country: "SA", platforms: ["instagram"], categories: ["Fashion","Lifestyle"], followers: { ig: 889000 }, startingPrice: 3200, badges: ["Top Creator","Responds Fast"], cover: "https://picsum.photos/seed/doaa.alhothefy/1200/600" },
  { username: "nojoud.alrumaihi", name: "Nojoud Alrumaihi · نجود الرميحي", email: "nojoud@example.dev", headline: "Cultural fashion architect · Founder @ci.creatives", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram"], categories: ["Fashion","Lifestyle"], followers: { ig: 635000 }, startingPrice: 2800, badges: ["Top Creator"], cover: "https://picsum.photos/seed/nojoud.alrumaihi/1200/600" },
  { username: "layali.boker", name: "Layali Boker · ليالي بوكر", email: "layali@example.dev", headline: "Beauty creator · 2M على TikTok · Licensed advertiser", city: "Riyadh · الرياض", country: "SA", platforms: ["tiktok","instagram"], categories: ["Beauty","Lifestyle"], followers: { tt: 2000000, ig: 597000 }, startingPrice: 2400, badges: ["Top Creator","Responds Fast"], cover: "https://picsum.photos/seed/layali.boker/1200/600" },
  { username: "daim.gaw", name: "Daim Gaw · ديم قاو", email: "daim@example.dev", headline: "Beauty · Lifestyle · @boldmanagement", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","tiktok"], categories: ["Beauty","Fashion"], followers: { ig: 379000, tt: 220000 }, startingPrice: 1800, badges: ["Responds Fast"], cover: "https://picsum.photos/seed/daim.gaw/1200/600" },
  { username: "osamafilm", name: "Osama Alharbi · أسامة الحربي", email: "osama@example.dev", headline: "Drone DP · صانع أفلام · من المدينة المنورة", city: "Medina · المدينة المنورة", country: "SA", platforms: ["instagram","youtube"], categories: ["Travel","Lifestyle"], followers: { ig: 197000, yt: 84000 }, startingPrice: 1600, badges: ["Responds Fast"], cover: "https://picsum.photos/seed/osamafilm/1200/600" },
  { username: "hattan.alsaif", name: "Hattan Alsaif · حتان السيف", email: "hattan@example.dev", headline: "IFMA World Champion · PRO fighter · @alulaclub", city: "Riyadh · الرياض", country: "SA", platforms: ["instagram","tiktok"], categories: ["Fitness","Lifestyle"], followers: { ig: 137000, tt: 95000 }, startingPrice: 1200, badges: ["Top Creator","Verified"], cover: "https://picsum.photos/seed/hattan.alsaif/1200/600" },
];

async function main() {
  console.log("Seeding…");

  // Demo admin user is gated behind ENABLE_DEMO_ADMIN to prevent shipping a
  // known credential to any non-dev environment. Production bootstrap must
  // create the first admin via a separate script with secrets.
  if (process.env.ENABLE_DEMO_ADMIN === "1") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Refusing to seed demo admin in production. Bootstrap a real admin via secrets.");
    }
    const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "Admin1234!";
    const adminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@nakhla.sa";
    const adminHash = await bcrypt.hash(adminPassword, 11);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Nakhla Admin",
        role: "admin",
        passwordHash: adminHash,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`  Admin (dev only): ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("  Admin user NOT seeded. Set ENABLE_DEMO_ADMIN=1 for local dev.");
  }

  const brandHash = await bcrypt.hash("Password123!", 11);
  const brand = await prisma.user.upsert({
    where: { email: "brand@example.dev" },
    update: {},
    create: {
      email: "brand@example.dev",
      name: "Aseel KSA · أسيل",
      role: "brand",
      passwordHash: brandHash,
      brandProfile: { create: { brandName: "Aseel KSA · أسيل" } },
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
            { code: "SA", flag: "🇸🇦", pct: 72 },
            { code: "AE", flag: "🇦🇪", pct: 11 },
            { code: "KW", flag: "🇰🇼", pct: 6 },
            { code: "QA", flag: "🇶🇦", pct: 5 },
            { code: "BH", flag: "🇧🇭", pct: 3 },
            { code: "OM", flag: "🇴🇲", pct: 3 },
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
          title: "إطلاق مجموعة العباءات الصيفية · Summer abaya drop",
          description: "We need KSA fashion creators in Riyadh and Jeddah to film honest try-on reviews of our new summer modest collection. Focus on fabric breathability, cut, and how it pairs with daily looks.",
          budgetMin: 800, budgetMax: 6000,
          platforms: ["instagram", "tiktok"],
          categories: ["Fashion", "Lifestyle"],
          creatorsNeeded: 10,
        },
        {
          brandId: brand.id,
          title: "قهوة سعودية مختصة — UGC للإعلانات · Specialty coffee UGC",
          description: "نحتاج 30 فيديو UGC عمودي يظهر علب القهوة السعودية المختصة الجديدة. زاوية الروتين الصباحي مفضّلة. سيتم بثها على ميتا وتيك توك وسناب شات في السوق السعودي.",
          budgetMin: 500, budgetMax: 2500,
          platforms: ["ugc", "tiktok"],
          categories: ["Food", "Lifestyle"],
          creatorsNeeded: 30,
        },
      ],
    });
  }

  console.log("Seed done.");
  console.log("  Brand   : brand@example.dev / Password123!  (Aseel KSA)");
  console.log("  Creator : barmz@example.dev / Password123!  (Riyadh, comedy · 6.4M IG)");
  console.log(`  Seeded ${SEEDS.length} KSA creators.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
