import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { Prisma, type PaymentProviderKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { MockGateway } from "./mock.gateway";
import { TapGateway } from "./tap.gateway";
import type { PaymentGateway, WebhookVerification } from "./payment-gateway.interface";

// Event types (normalised) that mean "the charge landed in PSP escrow".
const CHARGE_SUCCEEDED_TYPES = new Set(["charge.succeeded", "charge_succeeded", "charge.captured"]);

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
    private mock: MockGateway,
    private tap: TapGateway,
  ) {}

  private gatewayFor(provider: string): PaymentGateway {
    if (provider === "mock") return this.mock;
    if (provider === "tap") return this.tap;
    throw new NotFoundException(`Unknown payment provider "${provider}"`);
  }

  /**
   * Capture-first webhook intake: persist the WebhookEvent row BEFORE any
   * processing so PSP replays dedupe on @@unique([provider, eventId]) and
   * processing failures stay debuggable (error column) instead of bubbling
   * up as 5xx — PSPs retry on non-2xx, and we already have the event.
   */
  async handleWebhook(providerParam: string, rawBody: Buffer | undefined, headers: Record<string, any>) {
    const gateway = this.gatewayFor(providerParam);
    const provider = gateway.kind;
    if (!rawBody?.length) throw new BadRequestException("Missing request body");

    const v = gateway.verifyWebhook(rawBody, headers);
    if (!v.valid) {
      // Keep forensics on rejected attempts, but never let a bookkeeping
      // failure mask the 400.
      await this.prisma.webhookEvent
        .create({
          data: {
            provider,
            eventId: v.eventId || `invalid_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`,
            eventType: v.eventType || "unknown",
            payload: (v.payload ?? {}) as Prisma.InputJsonValue,
            signatureValid: false,
            error: "Invalid signature",
          },
        })
        .catch(() => undefined);
      throw new BadRequestException("Invalid webhook signature");
    }
    if (!v.eventId) throw new BadRequestException("Webhook payload missing eventId");

    let event;
    try {
      event = await this.prisma.webhookEvent.create({
        data: {
          provider,
          eventId: v.eventId,
          eventType: v.eventType || "unknown",
          payload: (v.payload ?? {}) as Prisma.InputJsonValue,
          signatureValid: true,
        },
      });
    } catch (e) {
      // Duplicate delivery — already captured (and possibly processed). Ack
      // with 200 so the PSP stops retrying; never reprocess.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { ok: true, duplicate: true };
      }
      throw e;
    }

    try {
      const result = await this.process(provider, v);
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });
      return { ok: true, duplicate: false, ...result };
    } catch (err: any) {
      const message = String(err?.message ?? err).slice(0, 1000);
      this.logger.warn(`Webhook ${provider}/${v.eventId} processing failed: ${message}`);
      await this.prisma.webhookEvent
        .update({ where: { id: event.id }, data: { error: message } })
        .catch(() => undefined);
      // Still 200 — the event is captured; retrying won't fix a bad payload.
      return { ok: true, duplicate: false, processed: false };
    }
  }

  private async process(provider: PaymentProviderKind, v: WebhookVerification) {
    if (CHARGE_SUCCEEDED_TYPES.has(v.eventType)) {
      const orderId = String(
        v.payload?.orderId ?? v.payload?.metadata?.orderId ?? v.payload?.reference?.order ?? "",
      );
      if (!orderId) throw new Error("charge event has no order reference");
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error(`Order not found: ${orderId}`);
      // Idempotent: the brand may have hit pay() before the webhook landed.
      if (order.status !== "pending_payment") return { processed: true, skipped: "order already paid" };
      const providerRef = String(v.payload?.chargeId ?? v.payload?.id ?? v.eventId);
      await this.orders.recordCharge(orderId, provider, providerRef, {
        actorRole: "system",
        note: "Payment captured via webhook (escrow held)",
        meta: { webhookEventId: v.eventId, eventType: v.eventType },
      });
      return { processed: true };
    }
    // Unknown event types are acked and stored — nothing to do yet.
    return { processed: true, skipped: `unhandled event type "${v.eventType || "unknown"}"` };
  }
}
