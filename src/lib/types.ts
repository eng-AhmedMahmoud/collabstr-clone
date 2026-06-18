export type Platform = "instagram" | "tiktok" | "youtube" | "ugc";

export type Category =
  | "Fashion"
  | "Beauty"
  | "Travel"
  | "Fitness"
  | "Food"
  | "Lifestyle"
  | "Tech"
  | "Gaming"
  | "Music"
  | "Family"
  | "Comedy"
  | "Pets";

export type Package = {
  id: string;
  title: string;
  price: number;
  description?: string;
};

export type Creator = {
  username: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  avatar: string;
  cover: string;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  followers: { instagram?: number; tiktok?: number; youtube?: number };
  platforms: Platform[];
  categories: Category[];
  badges: ("Top Creator" | "Responds Fast" | "UGC")[];
  packages: Package[];
  audience: {
    locations: { code: string; flag: string; pct: number }[];
    ages: { range: string; pct: number }[];
    gender: { female: number; male: number };
    avgViews: number;
    engagement: number;
  };
  reviews: { brand: string; rating: number; date: string; text: string }[];
  portfolio: string[];
};

export type Campaign = {
  id: string;
  brand: string;
  title: string;
  budget: string;
  platforms: Platform[];
  categories: Category[];
  description: string;
  applicants: number;
  postedDaysAgo: number;
};
