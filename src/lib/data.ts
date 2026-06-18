import type { Creator, Campaign, Category, Platform } from "./types";

export const CATEGORIES: { label: Category; emoji: string }[] = [
  { label: "Fashion", emoji: "👗" },
  { label: "Beauty", emoji: "💄" },
  { label: "Travel", emoji: "✈️" },
  { label: "Fitness", emoji: "💪" },
  { label: "Food", emoji: "🍜" },
  { label: "Lifestyle", emoji: "🌿" },
  { label: "Tech", emoji: "💻" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Music", emoji: "🎵" },
  { label: "Family", emoji: "👨‍👩‍👧" },
  { label: "Comedy", emoji: "😂" },
  { label: "Pets", emoji: "🐶" },
];

export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎬" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "ugc", label: "UGC", icon: "🎥" },
];

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

const cover = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/600`;

const photo = (seed: string, i: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}-${i}/600/600`;

const make = (
  username: string,
  name: string,
  headline: string,
  city: string,
  country: string,
  platforms: Platform[],
  categories: Category[],
  badges: Creator["badges"],
  followers: Creator["followers"],
  startingPrice: number,
  rating = 5.0,
  reviewsCount = Math.floor(Math.random() * 40) + 4
): Creator => ({
  username,
  name,
  headline,
  bio: `${headline}. Working with brands across ${categories
    .slice(0, 2)
    .join(" and ")} to create thumb-stopping content that converts. Based in ${city}, available for global collabs.`,
  city,
  country,
  avatar: avatar(username),
  cover: cover(username),
  rating,
  reviewsCount,
  startingPrice,
  followers,
  platforms,
  categories,
  badges,
  packages: [
    { id: "p1", title: `1 ${platforms[0].toUpperCase()} Post`, price: startingPrice },
    { id: "p2", title: `1 ${platforms[0].toUpperCase()} Story`, price: Math.round(startingPrice * 0.6) },
    { id: "p3", title: `Bundle: 3 Posts + 5 Stories`, price: Math.round(startingPrice * 3.2) },
  ],
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
    avgViews: Math.round((followers.instagram ?? followers.tiktok ?? followers.youtube ?? 5000) * 0.18),
    engagement: Math.round((Math.random() * 4 + 2) * 10) / 10,
  },
  reviews: [
    { brand: "Wildbloom Co.", rating: 5, date: "2 weeks ago", text: "Delivered on brief and on time. Content performed above benchmarks." },
    { brand: "Northwind Apparel", rating: 5, date: "1 month ago", text: "Easy to work with, great communication, ROI was strong." },
    { brand: "Hopper", rating: 4.9, date: "2 months ago", text: "Quality content. Would book again." },
  ],
  portfolio: Array.from({ length: 6 }, (_, i) => photo(username, i)),
});

export const CREATORS: Creator[] = [
  make("ava.luxe", "Ava Lux", "Fashion & lifestyle storyteller", "Brooklyn, NY", "US",
    ["instagram","tiktok"], ["Fashion","Lifestyle"], ["Top Creator","Responds Fast"],
    { instagram: 248_000, tiktok: 180_000 }, 320),
  make("milo.creates", "Milo Park", "UGC for DTC brands that convert", "Austin, TX", "US",
    ["ugc","tiktok"], ["Tech","Lifestyle"], ["UGC","Responds Fast"],
    { tiktok: 42_000 }, 150),
  make("sage.kim", "Sage Kim", "Beauty creator & licensed esthetician", "Los Angeles, CA", "US",
    ["instagram","youtube"], ["Beauty","Lifestyle"], ["Top Creator"],
    { instagram: 612_000, youtube: 84_000 }, 850),
  make("travis.roams", "Travis Hale", "Adventure travel cinematographer", "Denver, CO", "US",
    ["youtube","instagram"], ["Travel","Lifestyle"], ["Top Creator","Responds Fast"],
    { youtube: 320_000, instagram: 96_000 }, 1200),
  make("nora.fit", "Nora Ellis", "Strength coach & nutrition tips", "Toronto, ON", "CA",
    ["instagram","tiktok"], ["Fitness","Lifestyle"], ["Responds Fast"],
    { instagram: 88_000, tiktok: 210_000 }, 220),
  make("kenji.eats", "Kenji Sato", "Tokyo food explorer", "Tokyo", "JP",
    ["tiktok","youtube"], ["Food","Travel"], ["Top Creator"],
    { tiktok: 1_100_000, youtube: 240_000 }, 1800),
  make("lulu.kids", "Lulu Marin", "Family vlogger, mom of three", "Phoenix, AZ", "US",
    ["instagram","youtube"], ["Family","Lifestyle"], ["Top Creator","Responds Fast"],
    { instagram: 156_000, youtube: 72_000 }, 480),
  make("riot.plays", "Rio Tanaka", "Gaming + tech reviews", "London", "GB",
    ["youtube","tiktok"], ["Gaming","Tech"], [],
    { youtube: 410_000, tiktok: 88_000 }, 950),
  make("sasha.beats", "Sasha Vox", "Indie music producer & DJ", "Berlin", "DE",
    ["tiktok","instagram"], ["Music","Lifestyle"], ["Responds Fast"],
    { tiktok: 320_000, instagram: 64_000 }, 600),
  make("oliver.pets", "Oliver Chen", "Golden retriever dad", "San Diego, CA", "US",
    ["instagram","tiktok"], ["Pets","Family"], ["Top Creator"],
    { instagram: 540_000, tiktok: 870_000 }, 700),
  make("zoe.haha", "Zoe Bell", "Comedy skits & relatable bits", "Chicago, IL", "US",
    ["tiktok"], ["Comedy","Lifestyle"], ["Top Creator","Responds Fast"],
    { tiktok: 1_600_000 }, 2200),
  make("ben.builds", "Ben Hart", "DIY & home tech reviews", "Seattle, WA", "US",
    ["youtube","ugc"], ["Tech","Lifestyle"], ["UGC"],
    { youtube: 96_000 }, 380),
  make("maya.styles", "Maya Reyes", "Plus-size fashion editor", "Miami, FL", "US",
    ["instagram","tiktok"], ["Fashion","Beauty"], ["Top Creator"],
    { instagram: 184_000, tiktok: 96_000 }, 420),
  make("noah.cooks", "Noah Park", "30-minute weeknight meals", "Portland, OR", "US",
    ["tiktok","instagram"], ["Food","Lifestyle"], ["Responds Fast"],
    { tiktok: 280_000, instagram: 60_000 }, 360),
  make("emma.runs", "Emma Wells", "Marathoner & athleisure", "Boston, MA", "US",
    ["instagram","youtube"], ["Fitness","Fashion"], ["Top Creator"],
    { instagram: 124_000, youtube: 38_000 }, 290),
  make("kai.surf", "Kai Brooks", "Surf & ocean conservation", "Honolulu, HI", "US",
    ["instagram","tiktok"], ["Travel","Lifestyle"], ["Top Creator","Responds Fast"],
    { instagram: 92_000, tiktok: 140_000 }, 350),
];

export function findCreator(username: string): Creator | undefined {
  return CREATORS.find((c) => c.username === username);
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    brand: "Wildbloom",
    title: "Spring drop — sustainable activewear",
    budget: "$200 – $1,200",
    platforms: ["instagram", "tiktok"],
    categories: ["Fashion", "Fitness"],
    description:
      "Looking for creators to film an honest review of our new spring activewear line. Focus on fit, fabric feel, and movement.",
    applicants: 124,
    postedDaysAgo: 3,
  },
  {
    id: "c2",
    brand: "Northwind Coffee",
    title: "Cold brew launch — UGC for paid ads",
    budget: "$150 – $500",
    platforms: ["ugc", "tiktok"],
    categories: ["Food", "Lifestyle"],
    description:
      "Need 30 UGC videos in vertical format showcasing our cold brew bottles. Morning routine angle preferred.",
    applicants: 412,
    postedDaysAgo: 1,
  },
  {
    id: "c3",
    brand: "Hopper Travel",
    title: "Hidden gems city series — short form",
    budget: "$500 – $3,000",
    platforms: ["tiktok", "youtube"],
    categories: ["Travel"],
    description:
      "Highlight one underrated neighborhood in your city. Booked flights through the Hopper app.",
    applicants: 86,
    postedDaysAgo: 6,
  },
  {
    id: "c4",
    brand: "Bloomtail Pet Co.",
    title: "Dog dad starter pack — Instagram reels",
    budget: "$100 – $800",
    platforms: ["instagram"],
    categories: ["Pets"],
    description: "Showcase our new chew-proof leash and harness on your daily walk.",
    applicants: 201,
    postedDaysAgo: 4,
  },
];
