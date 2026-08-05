import { Controller, HttpCode, Param, Post, Req } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { PaymentsService } from "./payments.service";

/**
 * PUBLIC endpoint — no JwtAuthGuard on purpose: PSPs authenticate with the
 * webhook signature over the raw body, not a user token. The origin-check
 * middleware passes server-to-server posts (no Origin header) through.
 */
@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("webhooks/:provider")
  @HttpCode(200)
  webhook(@Param("provider") provider: string, @Req() req: RawBodyRequest<Request>) {
    return this.payments.handleWebhook(provider, req.rawBody, req.headers as Record<string, any>);
  }
}
