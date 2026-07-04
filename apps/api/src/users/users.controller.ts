import { BadRequestException, Body, Controller, Delete, Get, Header, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Request, Response } from "express";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { AVATAR_DIR, AVATAR_LIMITS, avatarFileFilter, avatarFilename } from "../uploads/uploads.util";

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

  // Native mobile clients upload the image binary directly instead of a URL;
  // browsers can also POST a `<input type="file">` to this endpoint. The saved
  // file is served back through the static `/uploads` mount.
  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({ destination: AVATAR_DIR, filename: avatarFilename }),
      fileFilter: avatarFileFilter,
      limits: AVATAR_LIMITS,
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException("file required");
    const base = `${req.protocol}://${req.get("host")}`;
    const url = `${base}/uploads/avatars/${file.filename}`;
    await this.users.updateProfile(user.id, { avatarUrl: url });
    return { url };
  }

  @Post("password")
  changePassword(@CurrentUser() user: AuthUser, @Body() body: { current: string; next: string }) {
    return this.users.changePassword(user.id, body.current, body.next);
  }

  @Delete()
  remove(@CurrentUser() user: AuthUser) {
    return this.users.deleteAccount(user.id);
  }

  // PDPL/GDPR data portability — served as a download so the browser saves
  // the file instead of rendering a wall of JSON.
  @Get("export")
  @Header("Content-Disposition", 'attachment; filename="nakhla-data-export.json"')
  export(@CurrentUser() user: AuthUser) {
    return this.users.exportData(user.id);
  }
}
