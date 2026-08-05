import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { PaymentGatewayModule } from "../payments/payment-gateway.module";

@Module({
  imports: [PaymentGatewayModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  // Exported for AdminModule (force actions) and PaymentsModule (webhooks) —
  // every state transition must go through OrdersService.transition().
  exports: [OrdersService],
})
export class OrdersModule {}
