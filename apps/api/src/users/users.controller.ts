import { BadRequestException, Body, Controller, Delete, Patch, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";

const isProd = process.env.NODE_ENV === "production";

@UseGuards(JwtAuthGuard)
@Controller("users/me")
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch()
  update(
    @CurrentUser() user: AuthUser,
    @Body() body: { name?: string; avatarUrl?: string; locale?: "en" | "ar" | null },
  ) {
    return this.users.updateProfile(user.id, body);
  }

  @Post("locale")
  async setLocale(
    @CurrentUser() user: AuthUser,
    @Body("locale") locale: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (locale !== "en" && locale !== "ar") {
      throw new BadRequestException("locale must be 'en' or 'ar'");
    }
    const updated = await this.users.setLocale(user.id, locale);
    // Reflect the new preference in the client-visible cookie so the next
    // page render uses it without an extra round-trip.
    res.cookie("locale", locale, {
      httpOnly: false,
      secure: isProd,
      sameSite: (isProd ? "none" : "lax") as "none" | "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    return { locale: updated.locale };
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
