import { useInfiniteQuery, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "./client";
import { useAuth } from "@/auth/context";
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

// ─── Raw API row → client shape mappers ─────────────────────────────────────
// `api<T>` blindly casts the JSON, but the API returns Prisma rows whose shape
// differs from what the screens consume. Map in the queryFn so the cast stays
// honest. Orders: the row carries `amount`+`serviceFee` (no `total`), `events`
// (not `timeline`) and `deliveries` (not `deliverableUrl/Note`); list includes
// are also role-dependent (brand-view omits `brand`, creator-view omits
// `creator`), so every branch is defaulted.
type RawOrder = {
  id: string;
  status: OrderStatus;
  amount: number;
  serviceFee: number;
  createdAt: string;
  brief?: string;
  deadline?: string | null;
  package?: { title: string; price?: number } | null;
  brand?: { name: string; avatarUrl?: string | null } | null;
  creator?: { username?: string; user?: { name: string; avatarUrl?: string | null } } | null;
  events?: { id: string; status: string; note?: string | null; createdAt: string }[];
  deliveries?: { id: string; url: string; note?: string | null; createdAt: string }[];
};

function mapOrderListItem(o: RawOrder): OrderListItem {
  return {
    id: o.id,
    status: o.status,
    total: o.amount + o.serviceFee,
    createdAt: o.createdAt,
    package: { title: o.package?.title ?? "", price: o.package?.price ?? o.amount },
    brand: { name: o.brand?.name ?? "", avatarUrl: o.brand?.avatarUrl ?? null },
    creator: {
      username: o.creator?.username ?? "",
      user: { name: o.creator?.user?.name ?? "", avatarUrl: o.creator?.user?.avatarUrl ?? null },
    },
  };
}

function mapOrderDetail(o: RawOrder): OrderDetail {
  const latest = o.deliveries?.[0];
  return {
    ...mapOrderListItem(o),
    brief: o.brief ?? "",
    deadline: o.deadline ?? null,
    // The API has no per-event actor; render the transition + timestamp.
    timeline: (o.events ?? []).map((e) => ({
      id: e.id,
      action: e.status,
      at: e.createdAt,
      actor: "",
      note: e.note ?? null,
    })),
    deliverableUrl: latest?.url ?? null,
    deliverableNote: latest?.note ?? null,
  };
}

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
    // The API returns SavedCreator rows ({ id, creatorId, creator: {...} });
    // unwrap to the creator itself so `.id` is the profile id the screens
    // compare against (otherwise "Saved" state never matches → save looks broken).
    queryFn: async (): Promise<CreatorListItem[]> => {
      const rows = await api<{ creator: CreatorListItem }[]>("/creators/me/saved");
      return rows.map((r) => r.creator).filter(Boolean);
    },
    ...opts,
  });
}

export function useReviewsByCreator(creatorId: string, opts?: Opts<CreatorReview[]>) {
  return useQuery({
    queryKey: qk.reviewsByCreator(creatorId),
    // The Review row stores the comment as `text`; the screens read `body`.
    queryFn: async (): Promise<CreatorReview[]> => {
      const rows = await api<(Omit<CreatorReview, "body"> & { text: string | null })[]>(
        `/reviews/creator/${creatorId}`,
      );
      return rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.text ?? null,
        createdAt: r.createdAt,
        author: r.author,
      }));
    },
    enabled: !!creatorId,
    ...opts,
  });
}

export function useMyOrders(role?: "brand" | "creator", opts?: Opts<OrderListItem[]>) {
  return useQuery({
    queryKey: qk.orders(role),
    queryFn: async (): Promise<OrderListItem[]> => {
      const rows = await api<RawOrder[]>("/orders", { query: { role } });
      return rows.map(mapOrderListItem);
    },
    ...opts,
  });
}

export function useOrderById(id: string, opts?: Opts<OrderDetail>) {
  return useQuery({
    queryKey: qk.orderById(id),
    queryFn: async (): Promise<OrderDetail> => mapOrderDetail(await api<RawOrder>(`/orders/${id}`)),
    enabled: !!id,
    ...opts,
  });
}

// The API returns raw thread/message rows; the screens want a viewer-relative
// shape (peer = the OTHER participant, fromMe on each message). Map here using
// the signed-in user's id — casting the raw rows straight to Thread[] left
// `peer`/`fromMe` undefined and crashed the inbox.
type RawParticipant = { id: string; name: string; avatarUrl: string | null };
type RawThread = {
  id: string;
  brandId: string;
  creatorUserId: string;
  lastMessageAt: string;
  brand: RawParticipant;
  creator: RawParticipant;
  messages: { id: string; senderId: string; body: string; createdAt: string; readAt: string | null }[];
};
type RawMessage = { id: string; senderId: string; body: string; createdAt: string; readAt: string | null };

export function useThreads(opts?: Opts<Thread[]>) {
  const { me } = useAuth();
  const myId = me?.id;
  return useQuery({
    queryKey: qk.threads(),
    queryFn: async (): Promise<Thread[]> => {
      const rows = await api<RawThread[]>("/threads");
      return rows.map((tRow) => {
        const peer = myId && tRow.brandId === myId ? tRow.creator : tRow.brand;
        const last = tRow.messages?.[0];
        return {
          id: tRow.id,
          updatedAt: tRow.lastMessageAt,
          peer: { id: peer?.id ?? "", name: peer?.name ?? "", avatarUrl: peer?.avatarUrl ?? null },
          lastMessage: last ? { body: last.body, createdAt: last.createdAt, fromMe: last.senderId === myId } : null,
          unread: last && last.senderId !== myId && !last.readAt ? 1 : 0,
        };
      });
    },
    ...opts,
  });
}

export function useThreadMessages(threadId: string, opts?: Opts<ChatMessage[]>) {
  const { me } = useAuth();
  const myId = me?.id;
  return useQuery({
    queryKey: qk.messages(threadId),
    queryFn: async (): Promise<ChatMessage[]> => {
      const rows = await api<RawMessage[]>(`/threads/${threadId}/messages`);
      return rows.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId,
        fromMe: m.senderId === myId,
      }));
    },
    enabled: !!threadId,
    refetchInterval: 8000,
    ...opts,
  });
}

export function useNotifications(opts?: Opts<NotificationItem[]>) {
  return useQuery({
    queryKey: qk.notifications(),
    // The API row exposes `readAt` (nullable) + a localized (possibly null)
    // `body`; the screens read a boolean `read` and a non-null `body`.
    queryFn: async (): Promise<NotificationItem[]> => {
      const rows = await api<
        (Omit<NotificationItem, "read" | "body"> & { readAt: string | null; body: string | null })[]
      >("/notifications");
      return rows.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body ?? "",
        href: n.href ?? null,
        read: !!n.readAt,
        createdAt: n.createdAt,
      }));
    },
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

// /admin/payouts is a GROUP BY creatorId aggregate — there is no per-row id,
// createdAt or status. Only released totals + order counts per creator.
export type AdminPayoutRow = {
  creatorId: string;
  username: string;
  name: string;
  amount: number;
  orders: number;
};

export type AdminAuditRow = {
  id: string;
  action: string;
  actor: string;
  target: string | null;
  createdAt: string;
  meta?: unknown;
};

// The /admin/overview payload nests counts under `totals` and returns
// `recentUsers` (not `recentSignups`); flatten to what the dashboard reads.
type RawAdminOverview = {
  totals: {
    users: number;
    creators: number;
    brands: number;
    campaigns: number;
    orders: number;
    gmv: number;
    escrow: number;
    open_disputes: number;
  };
  recentOrders: RawOrder[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
};

export function useAdminOverview(opts?: Opts<AdminOverview>) {
  return useQuery({
    queryKey: qk.adminOverview(),
    queryFn: async (): Promise<AdminOverview> => {
      const raw = await api<RawAdminOverview>("/admin/overview");
      return {
        users: raw.totals.users,
        brands: raw.totals.brands,
        creators: raw.totals.creators,
        orders: raw.totals.orders,
        disputes: raw.totals.open_disputes,
        revenue: raw.totals.gmv,
        // recentOrders here omit `package` — mapOrderListItem defaults it.
        recentOrders: raw.recentOrders.map(mapOrderListItem),
        recentSignups: raw.recentUsers,
      };
    },
    ...opts,
  });
}
export function useAdminUsers(q?: string, role?: string, opts?: Opts<AdminUserRow[]>) {
  return useQuery({
    queryKey: qk.adminUsers(q, role),
    // User rows carry `bannedAt` (nullable); the screen reads a boolean `banned`.
    queryFn: async (): Promise<AdminUserRow[]> => {
      const rows = await api<(Omit<AdminUserRow, "banned"> & { bannedAt: string | null })[]>(
        "/admin/users",
        { query: { q: q || undefined, role: role || undefined } },
      );
      return rows.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        banned: !!u.bannedAt,
        createdAt: u.createdAt,
      }));
    },
    ...opts,
  });
}
export function useAdminCreators(opts?: Opts<AdminUserRow[]>) {
  return useQuery({
    queryKey: qk.adminCreators(),
    // Returns CreatorProfile rows with a nested `user` — flatten name/email up.
    queryFn: async (): Promise<AdminUserRow[]> => {
      const rows = await api<{ id: string; createdAt: string; user: { name: string; email: string } }[]>(
        "/admin/creators",
      );
      return rows.map((c) => ({
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        role: "creator",
        banned: false,
        createdAt: c.createdAt,
      }));
    },
    ...opts,
  });
}
export function useAdminBrands(opts?: Opts<AdminUserRow[]>) {
  return useQuery({
    queryKey: qk.adminBrands(),
    // Returns BrandProfile rows with a nested `user` — flatten name/email up.
    queryFn: async (): Promise<AdminUserRow[]> => {
      const rows = await api<{ id: string; createdAt: string; user: { name: string; email: string } }[]>(
        "/admin/brands",
      );
      return rows.map((b) => ({
        id: b.id,
        name: b.user.name,
        email: b.user.email,
        role: "brand",
        banned: false,
        createdAt: b.createdAt,
      }));
    },
    ...opts,
  });
}
export function useAdminMawthooq(opts?: Opts<AdminMawthooqRow[]>) {
  return useQuery({
    queryKey: qk.adminMawthooq(),
    // Rows are CreatorProfile selects: `id` is the creatorId the review mutation
    // needs; name lives on nested `user`; fields are `mawthooq*`-prefixed.
    queryFn: async (): Promise<AdminMawthooqRow[]> => {
      const rows = await api<
        {
          id: string;
          username: string;
          mawthooqLicenseNo: string | null;
          mawthooqStatus: MawthooqStatus;
          mawthooqSubmittedAt: string | null;
          user: { name: string };
        }[]
      >("/admin/mawthooq");
      return rows.map((r) => ({
        creatorId: r.id,
        username: r.username,
        name: r.user.name,
        licenseNo: r.mawthooqLicenseNo ?? "",
        status: r.mawthooqStatus,
        submittedAt: r.mawthooqSubmittedAt ?? "",
      }));
    },
    ...opts,
  });
}
export function useAdminCampaigns(opts?: Opts<CampaignListItem[]>) {
  return useQuery({ queryKey: qk.adminCampaigns(), queryFn: () => api<CampaignListItem[]>("/admin/campaigns"), ...opts });
}
export function useAdminOrders(status?: string, opts?: Opts<OrderListItem[]>) {
  return useQuery({
    queryKey: qk.adminOrders(status),
    queryFn: async (): Promise<OrderListItem[]> => {
      const rows = await api<RawOrder[]>("/admin/orders", { query: { status: status || undefined } });
      return rows.map(mapOrderListItem);
    },
    ...opts,
  });
}
export function useAdminOrderById(id: string, opts?: Opts<OrderDetail>) {
  return useQuery({
    queryKey: qk.adminOrderById(id),
    queryFn: async (): Promise<OrderDetail> => mapOrderDetail(await api<RawOrder>(`/admin/orders/${id}`)),
    enabled: !!id,
    ...opts,
  });
}
export function useAdminReviews(opts?: Opts<AdminReviewRow[]>) {
  return useQuery({
    queryKey: qk.adminReviews(),
    // Review row stores the comment as `text`; the screen reads `body`.
    queryFn: async (): Promise<AdminReviewRow[]> => {
      const rows = await api<(Omit<AdminReviewRow, "body"> & { text: string | null })[]>("/admin/reviews");
      return rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.text ?? null,
        createdAt: r.createdAt,
        author: r.author,
        creator: r.creator,
      }));
    },
    ...opts,
  });
}
export function useAdminPayouts(opts?: Opts<AdminPayoutRow[]>) {
  return useQuery({
    queryKey: qk.adminPayouts(),
    // Aggregate rows: { creator: CreatorProfile+user, amount, orders }.
    queryFn: async (): Promise<AdminPayoutRow[]> => {
      const rows = await api<
        { creator: { id: string; username: string; user: { name: string } }; amount: number; orders: number }[]
      >("/admin/payouts");
      return rows.map((r) => ({
        creatorId: r.creator.id,
        username: r.creator.username,
        name: r.creator.user.name,
        amount: r.amount,
        orders: r.orders,
      }));
    },
    ...opts,
  });
}
export function useAdminAudit(opts?: Opts<AdminAuditRow[]>) {
  return useQuery({
    queryKey: qk.adminAudit(),
    // Audit rows are admin-tagged OrderEvents; derive action/actor/target.
    queryFn: async (): Promise<AdminAuditRow[]> => {
      const rows = await api<
        { id: string; status: string; note: string | null; createdAt: string; orderId: string; order: { brand: { name: string } } | null }[]
      >("/admin/audit");
      return rows.map((r) => ({
        id: r.id,
        action: (r.note ?? "").replace(/^\[ADMIN\]\s*/, "") || r.status,
        actor: r.order?.brand?.name ?? "",
        target: `#${r.orderId.slice(-6)}`,
        createdAt: r.createdAt,
      }));
    },
    ...opts,
  });
}
