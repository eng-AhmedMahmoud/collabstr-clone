import { useInfiniteQuery, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "./client";
import type { Locale, MawthooqStatus, Platform, Category, OrderStatus } from "@collabstr/shared-types";

// ─── Shared response shapes ─────────────────────────────────────────────────

export type CreatorListItem = {
  id: string;
  username: string;
  headline: string;
  city: string;
  country: string;
  startingPrice: number | null;
  rating: number;
  reviewsCount: number;
  followersIg: number;
  followersTt: number;
  followersYt: number;
  mawthooqStatus: MawthooqStatus;
  user: { name: string; avatarUrl: string | null };
};

export type CreatorListResp = {
  total: number;
  page: number;
  pageSize: number;
  items: CreatorListItem[];
};

export type CreatorPackage = { id: string; title: string; price: number; description: string | null };

export type CreatorReview = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  author: { name: string; avatarUrl: string | null };
};

export type CreatorDetail = {
  id: string;
  userId: string;
  username: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  rating: number;
  reviewsCount: number;
  startingPrice: number | null;
  followersIg: number;
  followersTt: number;
  followersYt: number;
  mawthooqStatus: MawthooqStatus;
  mawthooqExpiresAt?: string | null;
  user: { name: string; avatarUrl: string | null };
  packages: CreatorPackage[];
  reviewsReceived: CreatorReview[];
};

export type OrderListItem = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  package: { title: string; price: number };
  brand: { name: string; avatarUrl: string | null };
  creator: { username: string; user: { name: string; avatarUrl: string | null } };
};

export type OrderTimelineEntry = {
  id: string;
  action: string;
  actor: string;
  at: string;
  note?: string | null;
  meta?: unknown;
};

export type OrderDetail = OrderListItem & {
  brief: string;
  deadline: string | null;
  timeline: OrderTimelineEntry[];
  deliverableUrl?: string | null;
  deliverableNote?: string | null;
};

export type Thread = {
  id: string;
  updatedAt: string;
  unread: number;
  peer: { id: string; name: string; avatarUrl: string | null; username?: string | null };
  lastMessage?: { body: string; createdAt: string; fromMe: boolean } | null;
};

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  fromMe: boolean;
  senderId: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
};

export type CampaignListItem = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  platforms: Platform[];
  categories: Category[];
  deadline: string | null;
  status: "open" | "closed" | "draft";
  createdAt: string;
  brand: { name: string; avatarUrl: string | null };
  applicationsCount?: number;
};

export type CampaignDetail = CampaignListItem & {
  creatorsNeeded: number | null;
  brandId: string;
};

export type ApplicationItem = {
  id: string;
  price: number;
  pitch: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  campaign: { id: string; title: string };
  creator?: { username: string; user: { name: string; avatarUrl: string | null } };
};

// ─── Query keys / hooks ─────────────────────────────────────────────────────

export const qk = {
  me: ["me"] as const,
  creators: (q?: string) => ["creators", q ?? ""] as const,
  creatorByUsername: (username: string) => ["creator", username] as const,
  savedCreators: () => ["saved-creators"] as const,
  reviewsByCreator: (creatorId: string) => ["reviews", "creator", creatorId] as const,
  orders: (role?: string) => ["orders", role ?? "any"] as const,
  orderById: (id: string) => ["order", id] as const,
  threads: () => ["threads"] as const,
  messages: (threadId: string) => ["thread", threadId] as const,
  notifications: () => ["notifications"] as const,
  campaigns: (filters?: string) => ["campaigns", filters ?? ""] as const,
  campaignById: (id: string) => ["campaign", id] as const,
  myCampaigns: () => ["campaigns", "mine"] as const,
  myApplications: () => ["applications", "mine"] as const,
  brandOverview: () => ["dashboard", "brand"] as const,
  creatorMe: () => ["creator", "me"] as const,
  adminOverview: () => ["admin", "overview"] as const,
  adminUsers: (q?: string, role?: string) => ["admin", "users", q ?? "", role ?? ""] as const,
  adminCreators: () => ["admin", "creators"] as const,
  adminBrands: () => ["admin", "brands"] as const,
  adminMawthooq: () => ["admin", "mawthooq"] as const,
  adminCampaigns: () => ["admin", "campaigns"] as const,
  adminOrders: (status?: string) => ["admin", "orders", status ?? ""] as const,
  adminOrderById: (id: string) => ["admin", "order", id] as const,
  adminReviews: () => ["admin", "reviews"] as const,
  adminPayouts: () => ["admin", "payouts"] as const,
  adminAudit: () => ["admin", "audit"] as const,
} as const;

type Opts<T> = Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">;

export function useCreatorsInfinite(q: string) {
  return useInfiniteQuery({
    queryKey: qk.creators(q),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api<CreatorListResp>("/creators", { query: { q: q || undefined, page: pageParam as number, pageSize: 24 }, auth: false }),
    getNextPageParam: (last) => {
      const seen = last.page * last.pageSize;
      return seen < last.total ? last.page + 1 : undefined;
    },
  });
}

export function useCreatorByUsername(username: string, opts?: Opts<CreatorDetail>) {
  return useQuery({
    queryKey: qk.creatorByUsername(username),
    queryFn: () => api<CreatorDetail>(`/creators/by-username/${username}`, { auth: false }),
    ...opts,
  });
}

export function useSavedCreators(opts?: Opts<CreatorListItem[]>) {
  return useQuery({
    queryKey: qk.savedCreators(),
    queryFn: () => api<CreatorListItem[]>("/creators/me/saved"),
    ...opts,
  });
}

export function useReviewsByCreator(creatorId: string, opts?: Opts<CreatorReview[]>) {
  return useQuery({
    queryKey: qk.reviewsByCreator(creatorId),
    queryFn: () => api<CreatorReview[]>(`/reviews/creator/${creatorId}`),
    enabled: !!creatorId,
    ...opts,
  });
}

export function useMyOrders(role?: "brand" | "creator", opts?: Opts<OrderListItem[]>) {
  return useQuery({
    queryKey: qk.orders(role),
    queryFn: () => api<OrderListItem[]>("/orders", { query: { role } }),
    ...opts,
  });
}

export function useOrderById(id: string, opts?: Opts<OrderDetail>) {
  return useQuery({
    queryKey: qk.orderById(id),
    queryFn: () => api<OrderDetail>(`/orders/${id}`),
    enabled: !!id,
    ...opts,
  });
}

export function useThreads(opts?: Opts<Thread[]>) {
  return useQuery({
    queryKey: qk.threads(),
    queryFn: () => api<Thread[]>("/threads"),
    ...opts,
  });
}

export function useThreadMessages(threadId: string, opts?: Opts<ChatMessage[]>) {
  return useQuery({
    queryKey: qk.messages(threadId),
    queryFn: () => api<ChatMessage[]>(`/threads/${threadId}/messages`),
    enabled: !!threadId,
    refetchInterval: 8000,
    ...opts,
  });
}

export function useNotifications(opts?: Opts<NotificationItem[]>) {
  return useQuery({
    queryKey: qk.notifications(),
    queryFn: () => api<NotificationItem[]>("/notifications"),
    refetchInterval: 30_000,
    ...opts,
  });
}

export function useCampaigns(opts?: Opts<CampaignListItem[]>) {
  return useQuery({
    queryKey: qk.campaigns(),
    queryFn: () => api<CampaignListItem[]>("/campaigns", { auth: false }),
    ...opts,
  });
}

export function useCampaignById(id: string, opts?: Opts<CampaignDetail>) {
  return useQuery({
    queryKey: qk.campaignById(id),
    queryFn: () => api<CampaignDetail>(`/campaigns/${id}`, { auth: false }),
    enabled: !!id,
    ...opts,
  });
}

export function useMyCampaigns(opts?: Opts<CampaignListItem[]>) {
  return useQuery({
    queryKey: qk.myCampaigns(),
    queryFn: () => api<CampaignListItem[]>("/campaigns/mine"),
    ...opts,
  });
}

export function useMyApplications(opts?: Opts<ApplicationItem[]>) {
  return useQuery({
    queryKey: qk.myApplications(),
    queryFn: () => api<ApplicationItem[]>("/applications/mine"),
    ...opts,
  });
}

export function useCreatorMe(opts?: Opts<CreatorDetail & { mawthooqReviewNote?: string | null }>) {
  return useQuery({
    queryKey: qk.creatorMe(),
    queryFn: () => api<CreatorDetail & { mawthooqReviewNote?: string | null }>("/creators/me"),
    ...opts,
  });
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export type AdminOverview = {
  users: number;
  brands: number;
  creators: number;
  orders: number;
  disputes: number;
  revenue: number;
  recentOrders: OrderListItem[];
  recentSignups: { id: string; name: string; email: string; role: string; createdAt: string }[];
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: "brand" | "creator" | "admin";
  banned: boolean;
  createdAt: string;
};

export type AdminMawthooqRow = {
  creatorId: string;
  username: string;
  name: string;
  licenseNo: string;
  status: MawthooqStatus;
  submittedAt: string;
};

export type AdminReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  author: { name: string };
  creator: { username: string };
};

export type AdminPayoutRow = {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
  creator: { username: string };
};

export type AdminAuditRow = {
  id: string;
  action: string;
  actor: string;
  target: string | null;
  createdAt: string;
  meta?: unknown;
};

export function useAdminOverview(opts?: Opts<AdminOverview>) {
  return useQuery({ queryKey: qk.adminOverview(), queryFn: () => api<AdminOverview>("/admin/overview"), ...opts });
}
export function useAdminUsers(q?: string, role?: string, opts?: Opts<AdminUserRow[]>) {
  return useQuery({
    queryKey: qk.adminUsers(q, role),
    queryFn: () => api<AdminUserRow[]>("/admin/users", { query: { q: q || undefined, role: role || undefined } }),
    ...opts,
  });
}
export function useAdminCreators(opts?: Opts<AdminUserRow[]>) {
  return useQuery({ queryKey: qk.adminCreators(), queryFn: () => api<AdminUserRow[]>("/admin/creators"), ...opts });
}
export function useAdminBrands(opts?: Opts<AdminUserRow[]>) {
  return useQuery({ queryKey: qk.adminBrands(), queryFn: () => api<AdminUserRow[]>("/admin/brands"), ...opts });
}
export function useAdminMawthooq(opts?: Opts<AdminMawthooqRow[]>) {
  return useQuery({ queryKey: qk.adminMawthooq(), queryFn: () => api<AdminMawthooqRow[]>("/admin/mawthooq"), ...opts });
}
export function useAdminCampaigns(opts?: Opts<CampaignListItem[]>) {
  return useQuery({ queryKey: qk.adminCampaigns(), queryFn: () => api<CampaignListItem[]>("/admin/campaigns"), ...opts });
}
export function useAdminOrders(status?: string, opts?: Opts<OrderListItem[]>) {
  return useQuery({
    queryKey: qk.adminOrders(status),
    queryFn: () => api<OrderListItem[]>("/admin/orders", { query: { status: status || undefined } }),
    ...opts,
  });
}
export function useAdminOrderById(id: string, opts?: Opts<OrderDetail>) {
  return useQuery({
    queryKey: qk.adminOrderById(id),
    queryFn: () => api<OrderDetail>(`/admin/orders/${id}`),
    enabled: !!id,
    ...opts,
  });
}
export function useAdminReviews(opts?: Opts<AdminReviewRow[]>) {
  return useQuery({ queryKey: qk.adminReviews(), queryFn: () => api<AdminReviewRow[]>("/admin/reviews"), ...opts });
}
export function useAdminPayouts(opts?: Opts<AdminPayoutRow[]>) {
  return useQuery({ queryKey: qk.adminPayouts(), queryFn: () => api<AdminPayoutRow[]>("/admin/payouts"), ...opts });
}
export function useAdminAudit(opts?: Opts<AdminAuditRow[]>) {
  return useQuery({ queryKey: qk.adminAudit(), queryFn: () => api<AdminAuditRow[]>("/admin/audit"), ...opts });
}
