import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { OrderInput } from "@collabstr/shared-types";
import type { OrderStatus } from "@prisma/client";

const SERVICE_FEE = 0.06;

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["awaiting_creator", "cancelled"],
  awaiting_creator: ["in_progress", "cancelled"],
  in_progress: ["submitted", "cancelled"],
  submitted: ["revision_requested", "approved"],
  revision_requested: ["submitted", "cancelled"],
  approved: ["released"],
  released: [],
  cancelled: [],
  disputed: ["released", "cancelled"],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(brandId: string, input: OrderInput) {
    const pkg = await this.prisma.package.findUnique({ where: { id: input.packageId }, include: { creator: true } });
    if (!pkg) throw new NotFoundException("Package not found");
    const fee = Math.round(pkg.price * SERVICE_FEE);
    const order = await this.prisma.order.create({
      data: {
        brandId,
        creatorId: pkg.creatorId,
        packageId: pkg.id,
        brief: input.brief,
        amount: pkg.price,
        serviceFee: fee,
        deadline: input.deadline ? new Date(input.deadline) : null,
        events: { create: { status: "pending_payment", note: "Order created" } },
      },
    });
    return order;
  }

  async pay(brandId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.brandId !== brandId) throw new ForbiddenException();
    if (order.status !== "pending_payment") throw new BadRequestException("Already paid");
    return this.transition(orderId, "awaiting_creator", "Payment captured (escrow held)");
  }

  async list(userId: string, role: "brand" | "creator") {
    if (role === "brand") {
      return this.prisma.order.findMany({
        where: { brandId: userId },
        include: { creator: { include: { user: true } }, package: true },
        orderBy: { createdAt: "desc" },
      });
    }
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.order.findMany({
      where: { creatorId: profile.id },
      include: { brand: { select: { name: true, avatarUrl: true } }, package: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async byId(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        creator: { include: { user: true } },
        brand: { select: { id: true, name: true, avatarUrl: true } },
        package: true,
        events: { orderBy: { createdAt: "asc" } },
        deliveries: { orderBy: { createdAt: "desc" } },
        review: true,
      },
    });
    if (!order) throw new NotFoundException();
    if (order.brandId !== userId && order.creator.userId !== userId) throw new ForbiddenException();
    return order;
  }

  private async transition(orderId: string, to: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (!NEXT[order.status].includes(to)) {
      throw new BadRequestException(`Illegal transition ${order.status} → ${to}`);
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: to } }),
      this.prisma.orderEvent.create({ data: { orderId, status: to, note } }),
    ]);
    return updated;
  }

  async accept(userId: string, orderId: string) {
    const order = await this.assertCreator(userId, orderId);
    if (order.status !== "awaiting_creator") throw new BadRequestException();
    return this.transition(orderId, "in_progress", "Creator accepted");
  }

  async submit(userId: string, orderId: string, url: string, note?: string) {
    const order = await this.assertCreator(userId, orderId);
    if (!["in_progress", "revision_requested"].includes(order.status)) throw new BadRequestException();
    await this.prisma.delivery.create({ data: { orderId, url, note } });
    return this.transition(orderId, "submitted", note ?? "Delivery submitted");
  }

  async requestRevision(userId: string, orderId: string, note: string) {
    const order = await this.assertBrand(userId, orderId);
    if (order.status !== "submitted") throw new BadRequestException();
    return this.transition(orderId, "revision_requested", note);
  }

  async approve(userId: string, orderId: string) {
    const order = await this.assertBrand(userId, orderId);
    if (order.status !== "submitted") throw new BadRequestException();
    return this.transition(orderId, "approved", "Brand approved");
  }

  async release(userId: string, orderId: string) {
    const order = await this.assertBrand(userId, orderId);
    if (order.status !== "approved") throw new BadRequestException();
    return this.transition(orderId, "released", "Funds released to creator");
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.assertBrandOrCreator(userId, orderId);
    if (!["pending_payment", "awaiting_creator", "in_progress", "revision_requested", "disputed"].includes(order.status)) {
      throw new BadRequestException();
    }
    return this.transition(orderId, "cancelled", "Order cancelled");
  }

  async dispute(userId: string, orderId: string, reason: string) {
    const order = await this.assertBrandOrCreator(userId, orderId);
    if (!["submitted", "revision_requested", "approved"].includes(order.status)) throw new BadRequestException();
    return this.transition(orderId, "disputed", `Disputed: ${reason}`);
  }

  private async assertBrand(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.brandId !== userId) throw new ForbiddenException();
    return order;
  }
  private async assertCreator(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { creator: true } });
    if (!order) throw new NotFoundException();
    if (order.creator.userId !== userId) throw new ForbiddenException();
    return order;
  }
  private async assertBrandOrCreator(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { creator: true } });
    if (!order) throw new NotFoundException();
    if (order.brandId !== userId && order.creator.userId !== userId) throw new ForbiddenException();
    return order;
  }
}
