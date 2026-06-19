import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { LoginInput, SignupInput } from "@collabstr/shared-types";

const isProd = process.env.NODE_ENV === "production";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  };
  res.cookie("access_token", accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

function setLocaleCookie(res: Response, locale: "en" | "ar" | null | undefined) {
  if (locale !== "en" && locale !== "ar") return;
  res.cookie("locale", locale, {
    httpOnly: false, // read on the client for UI hydration
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("signup")
  @UsePipes(new ZodValidationPipe(SignupInput))
  async signup(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.signup(body);
    setAuthCookies(res, accessToken, refreshToken);
    setLocaleCookie(res, user.locale as any);
    return { id: user.id, email: user.email, name: user.name, role: user.role, locale: user.locale ?? "en" };
  }

  @Post("login")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginInput))
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.login(body);
    setAuthCookies(res, accessToken, refreshToken);
    setLocaleCookie(res, user.locale as any);
    return { id: user.id, email: user.email, name: user.name, role: user.role, locale: user.locale ?? "en" };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const { accessToken, refreshToken } = await this.auth.refresh(token);
    setAuthCookies(res, accessToken, refreshToken);
    return { ok: true };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    clearAuthCookies(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
