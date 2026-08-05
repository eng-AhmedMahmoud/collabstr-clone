import { Module } from "@nestjs/common";
import { PAYMENT_GATEWAY } from "./payment-gateway.interface";
import { MockGateway } from "./mock.gateway";
import { TapGateway } from "./tap.gateway";

/**
 * Gateway providers only (no controllers) so both OrdersModule (charges,
 * refunds, payouts) and PaymentsModule (webhooks) can import it without a
 * circular module dependency. PAYMENT_GATEWAY resolves the active provider
 * from the PAYMENT_PROVIDER env (mock | tap, default mock).
 */
@Module({
  providers: [
    MockGateway,
    TapGateway,
    {
      provide: PAYMENT_GATEWAY,
      inject: [MockGateway, TapGateway],
      useFactory: (mock: MockGateway, tap: TapGateway) =>
        process.env.PAYMENT_PROVIDER === "tap" ? tap : mock,
    },
  ],
  exports: [PAYMENT_GATEWAY, MockGateway, TapGateway],
})
export class PaymentGatewayModule {}
