import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PAYMENT_GATEWAY, type PaymentGateway } from "../payments/payment-gateway.interface";
import type { AuthUser } from "../common/current-user.decorator";
import type { OrderInput } from "@collabstr/shared-types";
import type { LedgerEntryType, OrderStatus, PaymentProviderKind, Prisma } from "@prisma/client";

const SERVICE_FEE = 0.06;

// The user-facing state machine. Admin force-actions may step outside it
// (e.g. cancel a submitted order) — transition() only enforces NEXT for
// non-privileged actors.
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

const PRIVILEGED_ROLES = ["admin", "superadmin"];

// Order responses embed the creator's account — never the raw User row.
const CREATOR_USER_SELECT = { select: { id: true, name: true, avatarUrl: true } } as const;

/** Who/why/what for a transition — lands on the OrderEvent audit row. */
export type TransitionCtx = {
  actorId?: string;
  actorRole?: string;
  note?: string;
  meta?: Prisma.InputJsonValue;
  /** Ledger rows written atomically with the status flip. */
  ledger?: Array<{
    type: LedgerEntryType;
    amount: number;
    provider: PaymentProviderKind;
    providerRef?: string;
  }>;
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY) private gateway: PaymentGateway,
  ) {}

  async create(actor: AuthUser, input: OrderInput) {
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
        brandId: actor.id,
        creatorId: pkg.creatorId,
        packageId: pkg.id,
        brief: input.brief,
        amount: pkg.price,
        serviceFee: fee,
        deadline: input.deadline ? new Date(input.deadline) : null,
        events: {
          create: { status: "pending_payment", note: "Order created", actorId: actor.id, actorRole: actor.role },
        },
      },
    });
    return order;
  }

  async pay(actor: AuthUser, orderId: string) {
    const order = await this.assertBrand(actor.id, orderId);
    if (order.status !== "pending_payment") throw new BadRequestException("Already paid");
    // Charge lives at the PSP — we only mirror it in the ledger.
    const { providerRef } = await this.gateway.createCharge(order);
    return this.recordCharge(orderId, this.gateway.kind, providerRef, {
      actorId: actor.id,
      actorRole: actor.role,
    });
  }

  /**
   * Shared by pay() and the PSP webhook path (actorRole "system"): write the
   * charge ledger row (amount + serviceFee) and move the order out of
   * pending_payment in one transaction.
   */
  async recordCharge(orderId: string, provider: PaymentProviderKind, providerRef: string, ctx: TransitionCtx) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    return this.transition(orderId, ["pending_payment"], "awaiting_creator", {
      note: "Payment captured (escrow held)",
      ...ctx,
      ledger: [{ type: "charge", amount: order.amount + order.serviceFee, provider, providerRef }],
    });
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

  /**
   * The single funnel every state change goes through — user, admin force
   * and webhook paths alike. Validates the source status, keeps the
   * conditional-write concurrency guard, and writes the structured
   * OrderEvent audit row (+ optional ledger rows) atomically.
   */
  async transition(orderId: string, allowedFrom: OrderStatus[], to: OrderStatus, ctx: TransitionCtx = {}) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (!allowedFrom.includes(order.status)) {
      throw new BadRequestException(`Illegal transition ${order.status} → ${to}`);
    }
    // Defense in depth: only admins/system may step outside the user-facing
    // state machine, and even they are bound by the caller's allowedFrom.
    const privileged = !ctx.actorRole || PRIVILEGED_ROLES.includes(ctx.actorRole) || ctx.actorRole === "system";
    if (!privileged && !NEXT[order.status].includes(to)) {
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
      await tx.orderEvent.create({
        data: {
          orderId,
          status: to,
          fromStatus: order.status,
          note: ctx.note,
          actorId: ctx.actorId,
          actorRole: ctx.actorRole,
          meta: ctx.meta ?? undefined,
        },
      });
      if (ctx.ledger?.length) {
        await tx.ledgerEntry.createMany({
          data: ctx.ledger.map((l) => ({ ...l, orderId, actorId: ctx.actorId ?? null })),
        });
      }
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }

  async accept(actor: AuthUser, orderId: string) {
    const order = await this.assertCreator(actor.id, orderId);
    if (order.status !== "awaiting_creator") throw new BadRequestException();
    return this.transition(orderId, ["awaiting_creator"], "in_progress", {
      actorId: actor.id,
      actorRole: actor.role,
      note: "Creator accepted",
    });
  }

  async submit(actor: AuthUser, orderId: string, url: string, note?: string) {
    const order = await this.assertCreator(actor.id, orderId);
    if (!["in_progress", "revision_requested"].includes(order.status)) throw new BadRequestException();
    await this.prisma.delivery.create({ data: { orderId, url, note } });
    return this.transition(orderId, ["in_progress", "revision_requested"], "submitted", {
      actorId: actor.id,
      actorRole: actor.role,
      note: note ?? "Delivery submitted",
    });
  }

  async requestRevision(actor: AuthUser, orderId: string, note: string) {
    const order = await this.assertBrand(actor.id, orderId);
    if (order.status !== "submitted") throw new BadRequestException();
    return this.transition(orderId, ["submitted"], "revision_requested", {
      actorId: actor.id,
      actorRole: actor.role,
      note,
    });
  }

  async approve(actor: AuthUser, orderId: string) {
    const order = await this.assertBrand(actor.id, orderId);
    if (order.status !== "submitted") throw new BadRequestException();
    return this.transition(orderId, ["submitted"], "approved", {
      actorId: actor.id,
      actorRole: actor.role,
      note: "Brand approved",
    });
  }

  async release(actor: AuthUser, orderId: string) {
    const order = await this.assertBrand(actor.id, orderId);
    if (order.status !== "approved") throw new BadRequestException();
    return this.releaseEscrow(orderId, ["approved"], {
      actorId: actor.id,
      actorRole: actor.role,
      note: "Funds released to creator",
    });
  }

  /**
   * Shared by brand release and admin force-release. PSP payout first, then
   * payout (order.amount) + commission (order.serviceFee) ledger rows land
   * atomically with the flip to released — closing the escrow invariant
   * charge - refund - payout - commission = 0.
   */
  async releaseEscrow(orderId: string, allowedFrom: OrderStatus[], ctx: TransitionCtx) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    // Validate before touching the PSP — no payout for an illegal transition.
    if (!allowedFrom.includes(order.status)) {
      throw new BadRequestException(`Illegal transition ${order.status} → released`);
    }
    const { providerRef } = await this.gateway.payout(order);
    return this.transition(orderId, allowedFrom, "released", {
      ...ctx,
      ledger: [
        { type: "payout", amount: order.amount, provider: this.gateway.kind, providerRef },
        { type: "commission", amount: order.serviceFee, provider: this.gateway.kind, providerRef },
      ],
    });
  }

  async cancel(actor: AuthUser, orderId: string) {
    const order = await this.assertBrandOrCreator(actor.id, orderId);
    const allowedFrom: OrderStatus[] = ["pending_payment", "awaiting_creator", "in_progress", "revision_requested", "disputed"];
    if (!allowedFrom.includes(order.status)) throw new BadRequestException();
    return this.cancelWithRefund(orderId, allowedFrom, {
      actorId: actor.id,
      actorRole: actor.role,
      note: "Order cancelled",
    });
  }

  /**
   * Shared by user cancel and admin force-cancel. If a charge ledger row
   * exists (the order was paid at some point), refund the full charge
   * (amount + serviceFee) at the PSP before flipping to cancelled.
   */
  async cancelWithRefund(orderId: string, allowedFrom: OrderStatus[], ctx: TransitionCtx) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (!allowedFrom.includes(order.status)) {
      throw new BadRequestException(`Illegal transition ${order.status} → cancelled`);
    }
    const charge = await this.prisma.ledgerEntry.findFirst({
      where: { orderId, type: "charge" },
      orderBy: { createdAt: "asc" },
    });
    let ledger: TransitionCtx["ledger"];
    if (charge) {
      const { providerRef } = await this.gateway.refund(order, charge.providerRef ?? undefined);
      ledger = [
        { type: "refund", amount: order.amount + order.serviceFee, provider: this.gateway.kind, providerRef },
      ];
    }
    return this.transition(orderId, allowedFrom, "cancelled", { ...ctx, ledger });
  }

  async dispute(actor: AuthUser, orderId: string, reason: string) {
    const order = await this.assertBrandOrCreator(actor.id, orderId);
    if (!["submitted", "revision_requested", "approved"].includes(order.status)) throw new BadRequestException();
    return this.transition(orderId, ["submitted", "revision_requested", "approved"], "disputed", {
      actorId: actor.id,
      actorRole: actor.role,
      note: `Disputed: ${reason}`,
    });
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
