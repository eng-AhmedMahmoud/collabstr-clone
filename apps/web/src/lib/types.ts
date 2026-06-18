import type { Platform, Category } from "@collabstr/shared-types";

export type ApiCreator = {
  id: string;
  username: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  coverUrl: string | null;
  startingPrice: number;
  rating: number;
  reviewsCount: number;
  followersIg: number | null;
  followersTt: number | null;
  followersYt: number | null;
  avgViews: number | null;
  engagement: number | null;
  platforms: Platform[];
  categories: Category[];
  badges: string[];
  portfolio: string[];
  audience: {
    locations: { code: string; flag: string; pct: number }[];
    ages: { range: string; pct: number }[];
    gender: { female: number; male: number };
  } | null;
  user: { name: string; avatarUrl: string | null };
  packages?: { id: string; title: string; price: number; description?: string | null }[];
  reviewsReceived?: {
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    author: { name: string; avatarUrl: string | null };
  }[];
};

export type ApiCampaign = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  platforms: Platform[];
  categories: Category[];
  creatorsNeeded: number;
  status: "draft" | "open" | "closed";
  createdAt: string;
  brand: { name: string; avatarUrl: string | null };
  _count?: { applications: number };
};

export type { Category, Platform } from "@collabstr/shared-types";
