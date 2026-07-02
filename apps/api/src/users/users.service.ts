import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string; locale?: "en" | "ar" | null }) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async setLocale(userId: string, locale: "en" | "ar") {
    return this.prisma.user.update({ where: { id: userId }, data: { locale } });
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) throw new NotFoundException("Current password incorrect");
    const passwordHash = await bcrypt.hash(next, 11);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }

  // PDPL art. 4 / GDPR art. 15 & 20 — full copy of the user's personal data
  // in a portable format. passwordHash and token hashes are secrets, not
  // personal data the subject needs back, so they are stripped.
  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        brandProfile: true,
        creatorProfile: { include: { packages: true } },
        notifications: true,
        savedCreators: true,
        reviewsLeft: true,
        campaigns: { include: { applications: true } },
        ordersAsBrand: { include: { events: true, deliveries: true } },
        threadsAsBrand: { include: { messages: true } },
        threadsAsCreator: { include: { messages: true } },
      },
    });
    if (!user) throw new NotFoundException();
    const { passwordHash: _passwordHash, ...safeUser } = user;
    const creatorOrders = user.creatorProfile
      ? await this.prisma.order.findMany({
          where: { creatorId: user.creatorProfile.id },
          include: { events: true, deliveries: true },
        })
      : [];
    return {
      exportedAt: new Date().toISOString(),
      format: "nakhla-data-export/v1",
      user: safeUser,
      ordersAsCreator: creatorOrders,
    };
  }
}
