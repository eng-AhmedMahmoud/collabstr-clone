import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { Throttle } from "@nestjs/throttler";
import { GoogleAuthInput, LoginInput, SignupInput } from "@collabstr/shared-types";

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
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async signup(@Body(new ZodValidationPipe(SignupInput)) body: any, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.signup(body);
    setAuthCookies(res, accessToken, refreshToken);
    setLocaleCookie(res, user.locale as any);
    // accessToken/refreshToken are also returned in the body so non-cookie
    // clients (mobile/RN) can hold them in secure storage. Web ignores them.
    return {
      id: user.id, email: user.email, name: user.name, role: user.role,
      locale: user.locale ?? "en", accessToken, refreshToken,
    };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(@Body(new ZodValidationPipe(LoginInput)) body: any, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.login(body);
    setAuthCookies(res, accessToken, refreshToken);
    setLocaleCookie(res, user.locale as any);
    return {
      id: user.id, email: user.email, name: user.name, role: user.role,
      locale: user.locale ?? "en", accessToken, refreshToken,
    };
  }

  @Post("google")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async google(@Body(new ZodValidationPipe(GoogleAuthInput)) body: any, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.googleLogin(body);
    setAuthCookies(res, accessToken, refreshToken);
    setLocaleCookie(res, user.locale as any);
    return {
      id: user.id, email: user.email, name: user.name, role: user.role,
      locale: user.locale ?? "en", accessToken, refreshToken,
    };
  }

  @Post("refresh")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async refresh(@Req() req: Request, @Body() body: any, @Res({ passthrough: true }) res: Response) {
    // Accept refresh token from cookie (web) or JSON body (mobile).
    const token: string | undefined = req.cookies?.refresh_token ?? body?.refreshToken;
    if (!token) throw new UnauthorizedException();
    const { accessToken, refreshToken } = await this.auth.refresh(token);
    setAuthCookies(res, accessToken, refreshToken);
    return { ok: true, accessToken, refreshToken };
  }

  @Post("logout")
  @HttpCode(204)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async logout(@Req() req: Request, @Body() body: any, @Res({ passthrough: true }) res: Response) {
    // Accept refresh token from cookie (web) or JSON body (mobile) so
    // non-cookie clients can revoke their session server-side.
    await this.auth.logout(req.cookies?.refresh_token ?? body?.refreshToken);
    clearAuthCookies(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  // The web client keeps its access token in an httpOnly cookie on the web
  // origin, so browser JS can't read it to authenticate a cross-origin socket.
  // This authenticated endpoint (reached same-origin via the Next rewrite, so
  // the cookie flows) hands the current access token back for the socket
  // handshake. Mobile skips this — it already holds the token in secure store.
  @UseGuards(JwtAuthGuard)
  @Get("ws-token")
  wsToken(@Req() req: Request) {
    return { token: req.cookies?.access_token ?? null };
  }
}
