import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { OrderInput } from "@collabstr/shared-types";
import type { OrderStatus } from "@prisma/client";

const SERVICE_FEE = 0.06;

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["awaiting_creator", "cancelled"],
  awaiting_creator: ["in_progress", "cancelled"],
  in_progress: ["submitted", "cancelled"],
  submitted: ["revision_requested", "approved", "disputed"],
  revision_requested: ["submitted", "cancelled", "disputed"],
  approved: ["released", "disputed"],
  released: [],
  cancelled: [],
  disputed: ["released", "cancelled"],
};

// Order responses embed the creator's account — never the raw User row.
const CREATOR_USER_SELECT = { select: { id: true, name: true, avatarUrl: true } } as const;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(brandId: string, input: OrderInput) {
    const pkg = await this.prisma.package.findUnique({ where: { id: input.packageId }, include: { creator: true } });
    if (!pkg) throw new NotFoundException("Package not found");
    // Mawthooq gate: Saudi firms face fines up to SAR 5M for contracting an
    // unlicensed advertiser. Enforced in production (ENFORCE_MAWTHOOQ=1); off by
    // default so demo/seed data (unverified creators) still transacts.
    if (process.env.ENFORCE_MAWTHOOQ === "1" && pkg.creator.mawthooqStatus !== "verified") {
      throw new BadRequestException("This creator's advertising licence is not verified yet");
    }
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
        include: { creator: { include: { user: CREATOR_USER_SELECT } }, package: true },
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
        creator: { include: { user: CREATOR_USER_SELECT } },
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
    return this.prisma.$transaction(async (tx) => {
      // Guard the update on the status we validated against — two concurrent
      // transitions (e.g. double pay/release) can both pass the check above,
      // but only one can win this conditional write.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: to },
      });
      if (count === 0) throw new ConflictException("Order was updated concurrently — refresh and retry");
      await tx.orderEvent.create({ data: { orderId, status: to, note } });
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
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
