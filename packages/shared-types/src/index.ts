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

export const Role = z.enum(["brand", "creator", "admin", "superadmin"]);
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
  role: Role.exclude(["admin", "superadmin"]),
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

export const MawthooqStatus = z.enum(["none", "pending", "verified", "rejected", "expired"]);
export type MawthooqStatus = z.infer<typeof MawthooqStatus>;

// Creator-submitted Mawthooq (GAMR advertising) licence. Number is the public
// licence identifier shown on the GAMR/Mawthooq registry — kept loose since the
// format is not publicly standardised; admin verifies the actual value.
export const MawthooqInput = z.object({
  licenseNo: z.string().trim().min(4).max(40),
});
export type MawthooqInput = z.infer<typeof MawthooqInput>;

// Admin decision on a submitted licence.
export const MawthooqReviewInput = z.object({
  decision: z.enum(["verified", "rejected"]),
  expiresAt: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
});
export type MawthooqReviewInput = z.infer<typeof MawthooqReviewInput>;

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
}).refine((c) => c.budgetMax >= c.budgetMin, {
  message: "budgetMax must be >= budgetMin",
  path: ["budgetMax"],
});
export type CampaignInput = z.infer<typeof CampaignInput>;

// Brand editing its own profile. All fields optional (partial update); blank
// strings clear the optional ones.
export const BrandProfileInput = z.object({
  brandName: z.string().min(2).max(120).optional(),
  website: z.string().max(2048).optional(),
  industry: z.string().max(120).optional(),
  about: z.string().max(2000).optional(),
  logoUrl: z.string().max(2048).optional(),
});
export type BrandProfileInput = z.infer<typeof BrandProfileInput>;

// Brand editing an existing campaign (partial). Same field rules as creation.
export const CampaignUpdateInput = z.object({
  title: z.string().min(4).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  platforms: z.array(Platform).min(1).optional(),
  categories: z.array(Category).min(1).optional(),
  deadline: z.string().datetime().nullable().optional(),
  creatorsNeeded: z.number().int().min(1).max(500).optional(),
  status: z.enum(["open", "closed", "draft"]).optional(),
}).refine((c) => c.budgetMin === undefined || c.budgetMax === undefined || c.budgetMax >= c.budgetMin, {
  message: "budgetMax must be >= budgetMin",
  path: ["budgetMax"],
});
export type CampaignUpdateInput = z.infer<typeof CampaignUpdateInput>;

export const ApplicationInput = z.object({
  price: z.number().int().min(10).max(1_000_000),
  pitch: z.string().min(10).max(3000),
});
export type ApplicationInput = z.infer<typeof ApplicationInput>;

export const ApplicationStatusInput = z.object({
  status: z.enum(["accepted", "rejected"]),
});
export type ApplicationStatusInput = z.infer<typeof ApplicationStatusInput>;

export const ReviewInput = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(2).max(3000),
});
export type ReviewInput = z.infer<typeof ReviewInput>;

export const DeliveryInput = z.object({
  url: z.string().url().max(2048),
  note: z.string().max(2000).optional(),
});
export type DeliveryInput = z.infer<typeof DeliveryInput>;

export const OrderNoteInput = z.object({
  note: z.string().min(2).max(2000),
});
export type OrderNoteInput = z.infer<typeof OrderNoteInput>;

export const OrderReasonInput = z.object({
  reason: z.string().min(2).max(2000),
});
export type OrderReasonInput = z.infer<typeof OrderReasonInput>;

export const SendMessageInput = z.object({
  body: z.string().min(1).max(5000),
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

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
