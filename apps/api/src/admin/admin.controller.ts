import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import type { OrderStatus, Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin")
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get("overview")
  overview() {
    return this.admin.overview();
  }

  @Get("users")
  listUsers(@Query("q") q?: string, @Query("role") role?: Role) {
    return this.admin.listUsers(q, role);
  }

  @Post("users/:id/ban")
  ban(@CurrentUser() me: AuthUser, @Param("id") id: string) {
    return this.admin.banUser(me.id, id);
  }

  @Post("users/:id/unban")
  unban(@Param("id") id: string) {
    return this.admin.unbanUser(id);
  }

  @Post("users/:id/promote-admin")
  promote(@Param("id") id: string) {
    return this.admin.promoteAdmin(id);
  }

  @Get("creators")
  creators() {
    return this.admin.listCreators();
  }

  @Get("brands")
  brands() {
    return this.admin.listBrands();
  }

  @Get("campaigns")
  campaigns() {
    return this.admin.listCampaigns();
  }

  @Get("orders")
  orders(@Query("status") status?: OrderStatus) {
    return this.admin.listOrders(status);
  }

  @Get("orders/:id")
  orderDetail(@Param("id") id: string) {
    return this.admin.orderDetail(id);
  }

  @Post("orders/:id/force-release")
  forceRelease(@Param("id") id: string, @Body("note") note?: string) {
    return this.admin.forceRelease(id, note ?? "");
  }

  @Post("orders/:id/force-cancel")
  forceCancel(@Param("id") id: string, @Body("reason") reason: string) {
    return this.admin.forceCancel(id, reason);
  }

  @Post("orders/:id/force-dispute")
  forceDispute(@Param("id") id: string, @Body("reason") reason: string) {
    return this.admin.forceDispute(id, reason);
  }

  @Get("reviews")
  reviews() {
    return this.admin.listReviews();
  }

  @Delete("reviews/:id")
  deleteReview(@Param("id") id: string) {
    return this.admin.deleteReview(id);
  }

  @Get("audit")
  audit() {
    return this.admin.auditLog();
  }

  @Get("payouts")
  payouts() {
    return this.admin.payouts();
  }

  @Post("broadcast")
  broadcast(
    @CurrentUser() me: AuthUser,
    @Body() body: { title: string; body: string; role?: Role }
  ) {
    return this.admin.broadcast(me.id, body.title, body.body, body.role);
  }
}
