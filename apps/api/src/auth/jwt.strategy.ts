import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET missing");
    super({
      // Bearer first: an explicit Authorization header is a deliberate client
      // choice (mobile), while cookies are ambient — RN's native cookie jar
      // replays stale auth cookies that would otherwise shadow a fresh token.
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload?.sub) throw new UnauthorizedException();
    // Live lookup so bans (and role changes) apply immediately instead of
    // after the 15-minute access-token TTL runs out.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, bannedAt: true },
    });
    if (!user || user.bannedAt) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }
}
