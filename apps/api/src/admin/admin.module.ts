import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { OrdersModule } from "../orders/orders.module";
import { ReconciliationModule } from "../reconciliation/reconciliation.module";

@Module({
  imports: [OrdersModule, ReconciliationModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
