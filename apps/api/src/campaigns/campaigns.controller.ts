import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CampaignInput } from "@collabstr/shared-types";

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

  @Get(":id")
  byId(@Param("id") id: string) {
    return this.campaigns.byId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post()
  @UsePipes(new ZodValidationPipe(CampaignInput))
  create(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.campaigns.create(user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Patch(":id/status")
  setStatus(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("status") status: "open" | "closed" | "draft") {
    return this.campaigns.setStatus(user.id, id, status);
  }
}
