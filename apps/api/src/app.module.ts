import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
})
export class AppModule {}
