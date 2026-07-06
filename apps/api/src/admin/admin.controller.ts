import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { BroadcastInput, MawthooqReviewInput } from "@collabstr/shared-types";
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

  // Minting new admins is a privileged action reserved for superadmins.
  // Method-level @Roles overrides the class-level @Roles("admin").
  @Post("users/:id/promote-admin")
  @Roles("superadmin")
  promote(@Param("id") id: string) {
    return this.admin.promoteAdmin(id);
  }

  // Revoke an admin back to their prior (non-privileged) role. Superadmin only.
  @Post("users/:id/demote-admin")
  @Roles("superadmin")
  demote(@Param("id") id: string) {
    return this.admin.demoteAdmin(id);
  }

  @Get("creators")
  creators() {
    return this.admin.listCreators();
  }

  @Get("mawthooq")
  mawthooqQueue() {
    return this.admin.mawthooqQueue();
  }

  @Post("mawthooq/:creatorId/review")
  reviewMawthooq(@Param("creatorId") creatorId: string, @Body(new ZodValidationPipe(MawthooqReviewInput)) body: MawthooqReviewInput) {
    return this.admin.reviewMawthooq(creatorId, body.decision, body.expiresAt, body.note);
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
    @Body(new ZodValidationPipe(BroadcastInput))
    body: { titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; href?: string; role?: Role },
  ) {
    return this.admin.broadcast(me.id, body, body.role);
  }
}
