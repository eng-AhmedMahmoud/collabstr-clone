import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OptionalJwtGuard } from "../auth/optional-jwt.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CampaignInput, CampaignUpdateInput } from "@collabstr/shared-types";

@Controller("campaigns")
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Get()
  list(@Query() q: { platform?: string; category?: string; status?: string }) {
    return this.campaigns.list(q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.campaigns.myCampaigns(user.id);
  }

  @UseGuards(OptionalJwtGuard)
  @Get(":id")
  async byId(@Param("id") id: string, @CurrentUser() user?: AuthUser) {
    const campaign = await this.campaigns.byId(id, user?.id);
    if (!campaign) throw new NotFoundException();
    return campaign;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post()
  create(@CurrentUser() user: AuthUser, @Body(new ZodValidationPipe(CampaignInput)) body: any) {
    return this.campaigns.create(user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Patch(":id/status")
  setStatus(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("status") status: "open" | "closed" | "draft") {
    return this.campaigns.setStatus(user.id, id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body(new ZodValidationPipe(CampaignUpdateInput)) body: CampaignUpdateInput) {
    return this.campaigns.update(user.id, id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.campaigns.remove(user.id, id);
  }
}
