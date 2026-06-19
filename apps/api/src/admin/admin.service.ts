import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { OrderStatus, Role } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

  async listCreators() {
    return this.prisma.creatorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async listBrands() {
    const brands = await this.prisma.brandProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true, id: true } } },
    });
    const stats = await Promise.all(
      brands.map(async (b) => {
        const orders = await this.prisma.order.aggregate({
          where: { brandId: b.user.id, status: "released" },
          _sum: { amount: true },
          _count: true,
        });
        return { ...b, totalOrders: orders._count, totalSpent: orders._sum.amount ?? 0 };
      })
    );
    return stats;
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

  async forceRelease(orderId: string, note: string) {
    return this.transition(orderId, "released", note || "Admin force release");
  }

  async forceCancel(orderId: string, reason: string) {
    if (!reason) throw new BadRequestException("Reason required");
    return this.transition(orderId, "cancelled", `Admin cancel: ${reason}`);
  }

  async forceDispute(orderId: string, reason: string) {
    if (!reason) throw new BadRequestException("Reason required");
    return this.transition(orderId, "disputed", `Admin dispute: ${reason}`);
  }

  private async transition(orderId: string, to: OrderStatus, note: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    const allowed = AdminService.ADMIN_TRANSITIONS[to];
    if (!allowed || !allowed.includes(order.status)) {
      throw new BadRequestException(
        `Admin cannot move order from "${order.status}" to "${to}". Allowed sources: ${(allowed ?? []).join(", ") || "none"}.`
      );
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: to } }),
      this.prisma.orderEvent.create({ data: { orderId, status: to, note: `[ADMIN] ${note}` } }),
    ]);
    return updated;
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
      where: { note: { startsWith: "[ADMIN]" } },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { order: { include: { brand: { select: { name: true } } } } },
    });
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
