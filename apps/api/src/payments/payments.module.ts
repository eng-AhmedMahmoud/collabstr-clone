import { Module } from "@nestjs/common";
import { PaymentGatewayModule } from "./payment-gateway.module";
import { OrdersModule } from "../orders/orders.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [PaymentGatewayModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
