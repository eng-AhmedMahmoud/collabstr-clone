import { Module } from "@nestjs/common";
import { ReconciliationService } from "./reconciliation.service";

// Endpoints live under /admin/reconciliation (AdminController) so they share
// the admin role guard; this module only owns the service + daily cron.
@Module({
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
