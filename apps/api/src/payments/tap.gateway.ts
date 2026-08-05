import { Injectable, NotImplementedException } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "crypto";
import type { Order, PaymentProviderKind } from "@prisma/client";
import type { PaymentGateway, WebhookVerification } from "./payment-gateway.interface";

const PENDING_MSG =
  "Tap gateway pending sandbox credentials — see docs/compliance-monitoring-blueprint.md";

/**
 * Tap Payments (KSA-licensed PSP) stub. Money-moving methods are gated on
 * TAP_SECRET_KEY / TAP_WEBHOOK_SECRET and the actual HTTP integration is
 * deferred until sandbox due diligence — they throw NotImplementedException
 * either way so no code path can pretend real money moved.
 */
@Injectable()
export class TapGateway implements PaymentGateway {
  readonly kind: PaymentProviderKind = "tap";

  private get secretKey() {
    return process.env.TAP_SECRET_KEY;
  }
  private get webhookSecret() {
    return process.env.TAP_WEBHOOK_SECRET;
  }

  private assertConfigured() {
    if (!this.secretKey || !this.webhookSecret) throw new NotImplementedException(PENDING_MSG);
  }

  async createCharge(_order: Order): Promise<{ providerRef: string }> {
    this.assertConfigured();
    // TODO(tap-sandbox): POST /v2/charges with amount, SAR, order metadata.
    throw new NotImplementedException(`Tap createCharge not wired yet — ${PENDING_MSG}`);
  }

  async refund(_order: Order, _providerRef?: string): Promise<{ providerRef: string }> {
    this.assertConfigured();
    // TODO(tap-sandbox): POST /v2/refunds referencing the original charge id.
    throw new NotImplementedException(`Tap refund not wired yet — ${PENDING_MSG}`);
  }

  async payout(_order: Order): Promise<{ providerRef: string }> {
    this.assertConfigured();
    // TODO(tap-sandbox): Tap "business transfers" / split-payment payout API.
    throw new NotImplementedException(`Tap payout not wired yet — ${PENDING_MSG}`);
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): WebhookVerification {
    let payload: any = null;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      /* keep payload null — still record the attempt upstream */
    }
    // Tap events carry an object type + status (e.g. charge / CAPTURED); we
    // normalise to "charge.captured"-style types.
    const eventId = String(payload?.id ?? payload?.eventId ?? "");
    const eventType = String(
      payload?.eventType ??
        (payload?.object && payload?.status
          ? `${payload.object}.${String(payload.status).toLowerCase()}`
          : ""),
    );

    const secret = this.webhookSecret;
    if (!secret || !payload) return { valid: false, eventId, eventType, payload };

    // NOTE(tap-sandbox): the exact header name and signing scheme MUST be
    // confirmed against Tap's webhook docs during sandbox due diligence —
    // Tap documents a "hashstring" computed over selected payload fields,
    // not necessarily an HMAC of the raw body. Until confirmed we verify an
    // HMAC-SHA256 of the raw body against TAP_WEBHOOK_SECRET and accept the
    // common header spellings.
    const provided = String(headers["x-tap-signature"] ?? headers["hashstring"] ?? "");
    const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(digest);
    const b = Buffer.from(provided);
    const valid = b.length > 0 && a.length === b.length && timingSafeEqual(a, b);
    return { valid, eventId, eventType, payload };
  }
}
