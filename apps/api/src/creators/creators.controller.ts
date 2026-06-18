import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreatorListQuery, PackageInput } from "@collabstr/shared-types";

@Controller("creators")
export class CreatorsController {
  constructor(private creators: CreatorsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(CreatorListQuery))
  list(@Query() q: CreatorListQuery) {
    return this.creators.list(q);
  }

  @Get("by-username/:username")
  byUsername(@Param("username") username: string) {
    return this.creators.byUsername(username);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Patch("me")
  updateMine(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.creators.updateMyProfile(user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Post("me/packages")
  @UsePipes(new ZodValidationPipe(PackageInput))
  addPackage(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.creators.addPackage(user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("creator")
  @Delete("me/packages/:id")
  removePackage(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.creators.deletePackage(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":creatorId/save")
  toggleSave(@CurrentUser() user: AuthUser, @Param("creatorId") creatorId: string) {
    return this.creators.toggleSave(user.id, creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/saved")
  saved(@CurrentUser() user: AuthUser) {
    return this.creators.listSaved(user.id);
  }
}
