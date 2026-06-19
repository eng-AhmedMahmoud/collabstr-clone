import { z } from "zod";

export const Locale = z.enum(["en", "ar"]);
export type Locale = z.infer<typeof Locale>;
export const LOCALES = ["en", "ar"] as const;
export const DEFAULT_LOCALE: Locale = "en";

// LocalizedString carries text in every supported locale. The backend stores
// system-generated copy this way so it can render in the reader's language
// regardless of the author's. Validate strictly to keep DB rows trustworthy.
export const LocalizedString = z.object({
  en: z.string().min(1).max(5000),
  ar: z.string().min(1).max(5000),
});
export type LocalizedString = z.infer<typeof LocalizedString>;

export function pickLocalized(s: LocalizedString | string, locale: Locale): string {
  if (typeof s === "string") return s;
  return s[locale] ?? s.en;
}

export const Platform = z.enum(["instagram", "tiktok", "youtube", "ugc"]);
export type Platform = z.infer<typeof Platform>;

export const Role = z.enum(["brand", "creator", "admin"]);
export type Role = z.infer<typeof Role>;

export const Category = z.enum([
  "Fashion","Beauty","Travel","Fitness","Food","Lifestyle",
  "Tech","Gaming","Music","Family","Comedy","Pets",
]);
export type Category = z.infer<typeof Category>;

export const OrderStatus = z.enum([
  "pending_payment",
  "awaiting_creator",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "released",
  "cancelled",
  "disputed",
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const SignupInput = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: Role.exclude(["admin"]),
  handle: z.string().optional(),
  locale: Locale.optional(),
});
export type SignupInput = z.infer<typeof SignupInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const PackageInput = z.object({
  title: z.string().min(2).max(120),
  price: z.number().int().min(10).max(100_000),
  description: z.string().max(2000).optional(),
});
export type PackageInput = z.infer<typeof PackageInput>;

export const CreatorListQuery = z.object({
  platform: Platform.optional(),
  category: Category.optional(),
  minPrice: z.coerce.number().int().optional(),
  maxPrice: z.coerce.number().int().optional(),
  minFollowers: z.coerce.number().int().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
});
export type CreatorListQuery = z.infer<typeof CreatorListQuery>;

export const CampaignInput = z.object({
  title: z.string().min(4).max(200),
  description: z.string().min(20).max(5000),
  budgetMin: z.number().int().min(0),
  budgetMax: z.number().int().min(0),
  platforms: z.array(Platform).min(1),
  categories: z.array(Category).min(1),
  deadline: z.string().datetime().optional(),
  creatorsNeeded: z.number().int().min(1).max(500).optional(),
});
export type CampaignInput = z.infer<typeof CampaignInput>;

export const OrderInput = z.object({
  packageId: z.string().min(1),
  brief: z.string().min(10).max(5000),
  deadline: z.string().datetime().optional(),
});
export type OrderInput = z.infer<typeof OrderInput>;

export const MessageInput = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(5000),
});
export type MessageInput = z.infer<typeof MessageInput>;

// Broadcast accepts both EN and AR up front so the admin doesn't ship copy
// only one half of the audience can read. Single-language broadcasts get
// rejected at the controller layer to enforce parity.
export const BroadcastInput = z.object({
  titleEn: z.string().min(2).max(140),
  titleAr: z.string().min(2).max(140),
  bodyEn: z.string().min(2).max(2000),
  bodyAr: z.string().min(2).max(2000),
  href: z.string().max(500).optional(),
  role: Role.optional(),
});
export type BroadcastInput = z.infer<typeof BroadcastInput>;

export type Me = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  creatorUsername?: string | null;
  locale: Locale;
};
