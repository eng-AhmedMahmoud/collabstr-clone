import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CreatorsModule } from "./creators/creators.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { ApplicationsModule } from "./applications/applications.module";
import { OrdersModule } from "./orders/orders.module";
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
    PrismaModule,
    AuthModule,
    UsersModule,
    CreatorsModule,
    CampaignsModule,
    ApplicationsModule,
    OrdersModule,
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
