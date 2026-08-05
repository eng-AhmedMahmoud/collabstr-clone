import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { UPLOAD_DIR } from "./uploads/uploads.util";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CreatorsModule } from "./creators/creators.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { ApplicationsModule } from "./applications/applications.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { ReconciliationModule } from "./reconciliation/reconciliation.module";
import { MessagesModule } from "./messages/messages.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { AdminModule } from "./admin/admin.module";
import { I18nModule } from "./i18n/i18n.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 300 requests/minute per IP. Auth endpoints override
    // with much stricter limits (see auth.controller.ts).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    // Cron host for the daily reconciliation run (03:00 Asia/Riyadh).
    ScheduleModule.forRoot(),
    // Serve uploaded avatars back under /uploads/*. Bypasses the /api/v1 global
    // prefix — that's fine, this is static content, not RPC.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), UPLOAD_DIR),
      serveRoot: "/uploads",
      serveStaticOptions: { index: false, redirect: false },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CreatorsModule,
    CampaignsModule,
    ApplicationsModule,
    OrdersModule,
    PaymentsModule,
    ReconciliationModule,
    MessagesModule,
    NotificationsModule,
    ReviewsModule,
    AdminModule,
    I18nModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
