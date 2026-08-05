import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { ESCROW_STATUSES } from "../reconciliation/reconciliation.service";
import type { AuthUser } from "../common/current-user.decorator";
import type { OrderStatus, Role } from "@prisma/client";

const ALL_STATUSES: OrderStatus[] = [
  "pending_payment",
  "awaiting_creator",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "released",
  "cancelled",
  "disputed",
];

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {}

  async overview() {
    const [users, creators, brands, campaigns, orders, gmvAgg, escrowAgg, disputes, recentOrders, recentUsers] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.creatorProfile.count(),
        this.prisma.brandProfile.count(),
        this.prisma.campaign.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({ where: { status: "released" }, _sum: { amount: true } }),
        this.prisma.order.aggregate({
          where: { status: { in: ["awaiting_creator", "in_progress", "submitted", "revision_requested", "approved"] } },
          _sum: { amount: true },
        }),
        this.prisma.order.count({ where: { status: "disputed" } }),
        this.prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            brand: { select: { name: true } },
            creator: { select: { user: { select: { name: true } } } },
          },
        }),
        this.prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
      ]);

    return {
      totals: {
        users,
        creators,
        brands,
        campaigns,
        orders,
        gmv: gmvAgg._sum.amount ?? 0,
        escrow: escrowAgg._sum.amount ?? 0,
        open_disputes: disputes,
      },
      recentOrders,
      recentUsers,
    };
  }

  async listUsers(q?: string, role?: Role) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, role: true, createdAt: true, bannedAt: true, emailVerifiedAt: true },
    });
  }

  async banUser(adminId: string, userId: string) {
    if (adminId === userId) throw new ForbiddenException("Can't ban yourself");
    const u = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundException();
    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { bannedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return user;
  }

  async unbanUser(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { bannedAt: null } });
  }

  async promoteAdmin(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
  }

  // Demote an admin back to a non-privileged role. We don't persist the prior
  // role, so we infer it from which profile the user owns: brand if they have a
  // brandProfile, creator if they have a creatorProfile, else fall back to
  // brand. Superadmins can never be demoted through this endpoint.
  async demoteAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { brandProfile: true, creatorProfile: true },
    });
    if (!user) throw new NotFoundException();
    if (user.role === "superadmin") throw new ForbiddenException("Cannot demote a superadmin");
    const role: Role = user.brandProfile ? "brand" : user.creatorProfile ? "creator" : "brand";
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async listCreators() {
    return this.prisma.creatorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  // Creators awaiting Mawthooq licence review (pending first, then recently decided).
  async mawthooqQueue() {
    return this.prisma.creatorProfile.findMany({
      where: { mawthooqStatus: { in: ["pending", "verified", "rejected", "expired"] } },
      orderBy: [{ mawthooqStatus: "asc" }, { mawthooqSubmittedAt: "desc" }],
      take: 200,
      select: {
        id: true, username: true, city: true,
        mawthooqStatus: true, mawthooqLicenseNo: true,
        mawthooqSubmittedAt: true, mawthooqVerifiedAt: true,
        mawthooqExpiresAt: true, mawthooqReviewNote: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  async reviewMawthooq(
    creatorId: string,
    decision: "verified" | "rejected",
    expiresAt?: string,
    note?: string,
  ) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { id: creatorId } });
    if (!profile) throw new NotFoundException("Creator not found");
    if (profile.mawthooqStatus === "none") {
      throw new BadRequestException("Creator has not submitted a licence");
    }
    return this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        mawthooqStatus: decision,
        mawthooqVerifiedAt: decision === "verified" ? new Date() : null,
        mawthooqExpiresAt: decision === "verified" && expiresAt ? new Date(expiresAt) : null,
        mawthooqReviewNote: note ?? null,
      },
      select: { id: true, mawthooqStatus: true, mawthooqVerifiedAt: true, mawthooqExpiresAt: true },
    });
  }

  async listBrands() {
    const brands = await this.prisma.brandProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true, id: true } } },
    });
    // Single groupBy instead of one aggregate round-trip per brand.
    const grouped = await this.prisma.order.groupBy({
      by: ["brandId"],
      where: { brandId: { in: brands.map((b) => b.user.id) }, status: "released" },
      _sum: { amount: true },
      _count: true,
    });
    const byBrand = new Map(grouped.map((g) => [g.brandId, g]));
    return brands.map((b) => {
      const g = byBrand.get(b.user.id);
      return { ...b, totalOrders: g?._count ?? 0, totalSpent: g?._sum.amount ?? 0 };
    });
  }

  async listCampaigns() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { brand: { select: { name: true } }, _count: { select: { applications: true } } },
    });
  }

  async listOrders(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        brand: { select: { name: true } },
        creator: { select: { user: { select: { name: true } } } },
        package: { select: { title: true } },
      },
    });
  }

  async orderDetail(id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true, email: true } },
        creator: { include: { user: { select: { name: true, email: true } } } },
        package: { select: { title: true } },
        events: { orderBy: { createdAt: "asc" } },
        deliveries: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!o) throw new NotFoundException();
    return o;
  }

  // Admin overrides are NOT a free pass. Each force-action declares which source
  // states it accepts. Anything else is rejected — payouts must not be conjured
  // from unpaid or already-closed orders.
  private static readonly ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
    released: ["approved", "disputed"],
    cancelled: ["pending_payment", "awaiting_creator", "in_progress", "submitted", "revision_requested", "disputed"],
    disputed: ["submitted", "revision_requested", "approved"],
  };

  // Force actions run through OrdersService so PSP calls, ledger rows and the
  // structured OrderEvent land exactly like user-initiated transitions — the
  // "[ADMIN]" note prefix stays for back-compat with older audit rows.
  async forceRelease(me: AuthUser, orderId: string, note: string) {
    return this.orders.releaseEscrow(orderId, AdminService.ADMIN_TRANSITIONS.released!, {
      actorId: me.id,
      actorRole: me.role,
      note: `[ADMIN] ${note || "Admin force release"}`,
    });
  }

  async forceCancel(me: AuthUser, orderId: string, reason: string) {
    if (!reason) throw new BadRequestException("Reason required");
    return this.orders.cancelWithRefund(orderId, AdminService.ADMIN_TRANSITIONS.cancelled!, {
      actorId: me.id,
      actorRole: me.role,
      note: `[ADMIN] Admin cancel: ${reason}`,
    });
  }

  async forceDispute(me: AuthUser, orderId: string, reason: string) {
    if (!reason) throw new BadRequestException("Reason required");
    return this.orders.transition(orderId, AdminService.ADMIN_TRANSITIONS.disputed!, "disputed", {
      actorId: me.id,
      actorRole: me.role,
      note: `[ADMIN] Admin dispute: ${reason}`,
    });
  }

  async listReviews() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: { select: { name: true } },
        creator: { select: { username: true, user: { select: { name: true } } } },
      },
    });
  }

  async deleteReview(id: string) {
    await this.prisma.review.delete({ where: { id } });
  }

  async auditLog() {
    return this.prisma.orderEvent.findMany({
      // Structured actorRole covers new rows; the "[ADMIN]" note prefix keeps
      // rows written before the audit columns existed.
      where: {
        OR: [{ actorRole: { in: ["admin", "superadmin"] } }, { note: { startsWith: "[ADMIN]" } }],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { order: { include: { brand: { select: { name: true } } } } },
    });
  }

  /** Contract consumed by the admin app's overview widgets — see apps/admin. */
  async metrics() {
    const now = Date.now();
    const d90 = new Date(now - 90 * 24 * 3600_000);
    const h72 = new Date(now - 72 * 3600_000);
    const d7 = new Date(now - 7 * 24 * 3600_000);
    const [byStatus, gmvAgg, escrowAgg, releasedEvents, slaSubmitted, slaDisputed] = await Promise.all([
      this.prisma.order.groupBy({ by: ["status"], _count: true }),
      this.prisma.order.aggregate({ where: { status: "released" }, _sum: { amount: true } }),
      this.prisma.order.aggregate({
        where: { status: { in: ESCROW_STATUSES } },
        _sum: { amount: true, serviceFee: true },
      }),
      this.prisma.orderEvent.findMany({
        where: { status: "released", createdAt: { gte: d90 } },
        select: { orderId: true, createdAt: true },
      }),
      this.prisma.order.count({ where: { status: "submitted", updatedAt: { lt: h72 } } }),
      this.prisma.order.count({ where: { status: "disputed", updatedAt: { lt: d7 } } }),
    ]);

    // Payout latency = approved → released gap. Force-releases from disputed
    // have no approved event and drop out of the sample.
    const approvedEvents = releasedEvents.length
      ? await this.prisma.orderEvent.findMany({
          where: { status: "approved", orderId: { in: releasedEvents.map((e) => e.orderId) } },
          select: { orderId: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        })
      : [];
    const approvedAt = new Map<string, Date>();
    for (const e of approvedEvents) if (!approvedAt.has(e.orderId)) approvedAt.set(e.orderId, e.createdAt);
    const latencies = releasedEvents
      .map((e) => {
        const a = approvedAt.get(e.orderId);
        return a ? (e.createdAt.getTime() - a.getTime()) / 3600_000 : null;
      })
      .filter((v): v is number => v !== null && v >= 0)
      .sort((x, y) => x - y);
    const avgHours = latencies.length
      ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10
      : null;
    const p90Hours = latencies.length
      ? Math.round(latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.9))] * 10) / 10
      : null;

    const counts = new Map(byStatus.map((s) => [s.status, s._count]));
    const total = byStatus.reduce((acc, s) => acc + s._count, 0);
    return {
      funnel: ALL_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 })),
      disputeRate: total ? (counts.get("disputed") ?? 0) / total : 0,
      payoutLatency: { avgHours, p90Hours, sampled: latencies.length },
      gmvReleased: gmvAgg._sum.amount ?? 0,
      escrowHeld: (escrowAgg._sum.amount ?? 0) + (escrowAgg._sum.serviceFee ?? 0),
      slaBreaches: { submittedOver72h: slaSubmitted, disputedOver7d: slaDisputed },
    };
  }

  async webhookEvents(take = 50) {
    const events = await this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(take, 1), 200),
      // payload deliberately excluded — raw PSP bodies stay out of list views.
      select: {
        id: true,
        provider: true,
        eventId: true,
        eventType: true,
        signatureValid: true,
        processedAt: true,
        error: true,
        createdAt: true,
      },
    });
    return { events };
  }

  async payouts() {
    const grouped = await this.prisma.order.groupBy({
      by: ["creatorId"],
      where: { status: "released" },
      _sum: { amount: true },
      _count: true,
    });
    const creators = await this.prisma.creatorProfile.findMany({
      where: { id: { in: grouped.map((g) => g.creatorId) } },
      include: { user: { select: { name: true, email: true } } },
    });
    const byId = new Map(creators.map((c) => [c.id, c]));
    return grouped
      .map((g) => ({
        creator: byId.get(g.creatorId)!,
        amount: g._sum.amount ?? 0,
        orders: g._count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  async broadcast(
    adminUserId: string,
    payload: { titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; href?: string },
    role?: Role,
  ) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
      select: { id: true },
    });
    const title = { en: payload.titleEn, ar: payload.titleAr };
    const body = { en: payload.bodyEn, ar: payload.bodyAr };
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        kind: "system" as const,
        title,
        body,
        href: payload.href ?? null,
      })),
    });
    return { sent: users.length };
  }
}
