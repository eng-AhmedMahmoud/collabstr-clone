import { z } from "zod";

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

export type Me = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  creatorUsername?: string | null;
};
