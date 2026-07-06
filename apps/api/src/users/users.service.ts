import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

// Returned to clients — never the raw User row (passwordHash et al.).
const PUBLIC_USER_SELECT = {
  id: true, email: true, name: true, role: true, avatarUrl: true, locale: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string; locale?: "en" | "ar" | null }) {
    // `data` arrives from an unvalidated request body — copy field by field so
    // extra keys (role, passwordHash, bannedAt, ...) can never reach Prisma.
    const safe: { name?: string; avatarUrl?: string; locale?: "en" | "ar" | null } = {};
    if (typeof data.name === "string" && data.name.trim().length > 0) safe.name = data.name.trim().slice(0, 120);
    if (typeof data.avatarUrl === "string") safe.avatarUrl = data.avatarUrl.slice(0, 2048);
    if (data.locale === "en" || data.locale === "ar" || data.locale === null) safe.locale = data.locale;
    return this.prisma.user.update({ where: { id: userId }, data: safe, select: PUBLIC_USER_SELECT });
  }

  async setLocale(userId: string, locale: "en" | "ar") {
    return this.prisma.user.update({ where: { id: userId }, data: { locale }, select: PUBLIC_USER_SELECT });
  }

  async getBrandProfile(userId: string) {
    const profile = await this.prisma.brandProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("No brand profile");
    return profile;
  }

  async updateBrandProfile(
    userId: string,
    data: { brandName?: string; website?: string; industry?: string; about?: string; logoUrl?: string },
  ) {
    const profile = await this.prisma.brandProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("No brand profile");
    // Whitelist editable fields — the raw body must never reach Prisma directly.
    const patch: { brandName?: string; website?: string | null; industry?: string | null; about?: string | null; logoUrl?: string | null } = {};
    if (typeof data.brandName === "string" && data.brandName.trim().length >= 2) patch.brandName = data.brandName.trim().slice(0, 120);
    if (typeof data.website === "string") patch.website = data.website.trim().slice(0, 2048) || null;
    if (typeof data.industry === "string") patch.industry = data.industry.trim().slice(0, 120) || null;
    if (typeof data.about === "string") patch.about = data.about.trim().slice(0, 2000) || null;
    if (typeof data.logoUrl === "string") patch.logoUrl = data.logoUrl.trim().slice(0, 2048) || null;
    return this.prisma.brandProfile.update({ where: { id: profile.id }, data: patch });
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    // Social-login accounts have no password; there is nothing to "change".
    if (!user.passwordHash) throw new BadRequestException("Account uses social login and has no password");
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) throw new BadRequestException("Current password incorrect");
    const passwordHash = await bcrypt.hash(next, 11);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  }

  async deleteAccount(userId: string) {
    // Deleting mid-order would cascade away escrowed money and its audit trail.
    const ACTIVE: Array<"pending_payment" | "awaiting_creator" | "in_progress" | "submitted" | "revision_requested" | "approved" | "disputed"> =
      ["pending_payment", "awaiting_creator", "in_progress", "submitted", "revision_requested", "approved", "disputed"];
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId }, select: { id: true } });
    const active = await this.prisma.order.count({
      where: {
        status: { in: ACTIVE },
        OR: [{ brandId: userId }, ...(creator ? [{ creatorId: creator.id }] : [])],
      },
    });
    if (active > 0) {
      throw new ConflictException("Account has active orders. Complete or cancel them before deleting.");
    }
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
