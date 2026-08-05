import type { Order, PaymentProviderKind } from "@prisma/client";

// Injection token for the active gateway (selected via PAYMENT_PROVIDER env).
export const PAYMENT_GATEWAY = "PAYMENT_GATEWAY";

export type WebhookVerification = {
  valid: boolean;
  eventId: string;
  eventType: string;
  payload: any;
};

/**
 * Provider-agnostic PSP facade. Regulatory constraint: the platform must
 * NEVER hold funds itself — money sits at a licensed PSP and every method
 * here returns the PSP's reference so LedgerEntry rows can mirror the
 * movement, not perform it.
 */
export interface PaymentGateway {
  readonly kind: PaymentProviderKind;
  /** Charge the brand order.amount + order.serviceFee into PSP escrow. */
  createCharge(order: Order): Promise<{ providerRef: string }>;
  /** Return the full charge to the brand. providerRef = original charge ref. */
  refund(order: Order, providerRef?: string): Promise<{ providerRef: string }>;
  /** Release order.amount from escrow to the creator. */
  payout(order: Order): Promise<{ providerRef: string }>;
  /** Verify + parse an inbound webhook. Must not throw on garbage input. */
  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): WebhookVerification;
}
