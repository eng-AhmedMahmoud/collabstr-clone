import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import type { Order, PaymentProviderKind } from "@prisma/client";
import type { PaymentGateway, WebhookVerification } from "./payment-gateway.interface";

// cuid-ish: sortable timestamp + random tail. Dev-only refs, not real money.
function mockRef(op: string) {
  return `mock_${op}_${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
}

/**
 * Dev/demo gateway: every operation succeeds instantly. Webhooks are plain
 * JSON bodies ({ eventId, eventType, ... }) signed with a shared secret in
 * the x-mock-signature header (MOCK_WEBHOOK_SECRET, default "dev").
 */
@Injectable()
export class MockGateway implements PaymentGateway {
  readonly kind: PaymentProviderKind = "mock";

  async createCharge(_order: Order) {
    return { providerRef: mockRef("chg") };
  }

  async refund(_order: Order, _providerRef?: string) {
    return { providerRef: mockRef("ref") };
  }

  async payout(_order: Order) {
    return { providerRef: mockRef("po") };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): WebhookVerification {
    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return { valid: false, eventId: "", eventType: "", payload: null };
    }
    const secret = process.env.MOCK_WEBHOOK_SECRET ?? "dev";
    const valid = headers["x-mock-signature"] === secret;
    return {
      valid,
      eventId: String(payload?.eventId ?? ""),
      eventType: String(payload?.eventType ?? ""),
      payload,
    };
  }
}
