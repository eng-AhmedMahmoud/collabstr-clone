import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ReqLocale, type Locale } from "../common/locale";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @ReqLocale() locale: Locale) {
    return this.svc.list(user.id, locale);
  }

  @Post(":id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.svc.markRead(user.id, id);
  }

  @Post("read-all")
  readAll(@CurrentUser() user: AuthUser) {
    return this.svc.markAllRead(user.id);
  }
}
