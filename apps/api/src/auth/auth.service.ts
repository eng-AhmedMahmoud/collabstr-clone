import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginInput, SignupInput } from "@collabstr/shared-types";

type AuthTokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private async issueTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const accessTtl = (process.env.JWT_ACCESS_TTL ?? "15m") as `${number}${"s" | "m" | "h" | "d"}`;
    const refreshTtl = (process.env.JWT_REFRESH_TTL ?? "30d") as `${number}${"s" | "m" | "h" | "d"}`;
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtl }
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, type: "refresh" },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtl }
    );

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });

    return { accessToken, refreshToken };
  }

  async signup(input: SignupInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, 11);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        passwordHash,
        ...(input.role === "brand"
          ? { brandProfile: { create: { brandName: input.name } } }
          : {
              creatorProfile: {
                create: {
                  username:
                    input.handle?.replace(/^@/, "").toLowerCase() ??
                    input.email.split("@")[0].toLowerCase() + "-" + crypto.randomBytes(2).toString("hex"),
                  headline: "New creator",
                  bio: "Just joined.",
                  city: "—",
                  country: "—",
                  platforms: [],
                  categories: [],
                  badges: [],
                  portfolio: [],
                },
              },
            }),
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.bannedAt) throw new ForbiddenException("Account disabled");
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Atomic rotation: only one concurrent refresh can flip the row from active to revoked.
    const claim = await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null, userId: payload.sub, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    if (claim.count !== 1) {
      // Either token is reused (possible compromise) or never existed: nuke the family.
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token reused or invalid");
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    if (user.bannedAt) throw new ForbiddenException("Account disabled");
    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true, brandProfile: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.bannedAt) throw new ForbiddenException("Account disabled");
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      creatorUsername: user.creatorProfile?.username ?? null,
      brandName: user.brandProfile?.brandName ?? null,
    };
  }
}
