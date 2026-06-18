import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { OrderInput } from "@collabstr/shared-types";

@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post()
  @UsePipes(new ZodValidationPipe(OrderInput))
  create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.orders.create(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query("role") role?: "brand" | "creator") {
    return this.orders.list(user.id, role ?? (user.role as any));
  }

  @Get(":id")
  byId(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.byId(user.id, id);
  }

  @Post(":id/pay")
  pay(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.pay(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Post(":id/accept")
  accept(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.accept(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Post(":id/submit")
  submit(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: { url: string; note?: string }
  ) {
    return this.orders.submit(user.id, id, body.url, body.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post(":id/revision")
  revision(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("note") note: string) {
    return this.orders.requestRevision(user.id, id, note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post(":id/approve")
  approve(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.approve(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post(":id/release")
  release(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.release(user.id, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.cancel(user.id, id);
  }

  @Post(":id/dispute")
  dispute(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("reason") reason: string) {
    return this.orders.dispute(user.id, id, reason);
  }
}
