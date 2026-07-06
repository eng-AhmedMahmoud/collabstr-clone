import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ApplicationInput, ApplicationStatusInput } from "@collabstr/shared-types";

@Controller()
export class ApplicationsController {
  constructor(private apps: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Post("campaigns/:campaignId/apply")
  apply(
    @CurrentUser() user: AuthUser,
    @Param("campaignId") campaignId: string,
    @Body(new ZodValidationPipe(ApplicationInput)) body: ApplicationInput
  ) {
    return this.apps.apply(user.id, campaignId, body.price, body.pitch);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Get("applications/mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.apps.mine(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Patch("applications/:id/status")
  setStatus(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(ApplicationStatusInput)) body: ApplicationStatusInput
  ) {
    return this.apps.setStatus(user.id, id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Patch("applications/:id/withdraw")
  withdraw(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.apps.withdraw(user.id, id);
  }
}
