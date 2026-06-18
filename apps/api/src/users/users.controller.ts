import { Body, Controller, Delete, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("users/me")
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() body: { name?: string; avatarUrl?: string }) {
    return this.users.updateProfile(user.id, body);
  }

  @Post("password")
  changePassword(@CurrentUser() user: AuthUser, @Body() body: { current: string; next: string }) {
    return this.users.changePassword(user.id, body.current, body.next);
  }

  @Delete()
  remove(@CurrentUser() user: AuthUser) {
    return this.users.deleteAccount(user.id);
  }
}
