import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreatorListQuery, PackageInput } from "@collabstr/shared-types";

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async list(q: CreatorListQuery) {
    const where: any = { user: { role: "creator" } };
    if (q.platform) where.platforms = { has: q.platform };
    if (q.category) where.categories = { has: q.category };
    if (q.minPrice !== undefined) where.startingPrice = { ...(where.startingPrice ?? {}), gte: q.minPrice };
    if (q.maxPrice !== undefined) where.startingPrice = { ...(where.startingPrice ?? {}), lte: q.maxPrice };
    if (q.minFollowers !== undefined) {
      where.OR = [
        { followersIg: { gte: q.minFollowers } },
        { followersTt: { gte: q.minFollowers } },
        { followersYt: { gte: q.minFollowers } },
      ];
    }
    if (q.q) {
      where.OR = [
        ...(where.OR ?? []),
        { headline: { contains: q.q, mode: "insensitive" } },
        { city: { contains: q.q, mode: "insensitive" } },
        { user: { name: { contains: q.q, mode: "insensitive" } } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.creatorProfile.count({ where }),
      this.prisma.creatorProfile.findMany({
        where,
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    return { total, page: q.page, pageSize: q.pageSize, items };
  }

  async byUsername(username: string) {
    const c = await this.prisma.creatorProfile.findUnique({
      where: { username },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        packages: { where: { isActive: true }, orderBy: { price: "asc" } },
        reviewsReceived: {
          take: 12,
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true, avatarUrl: true } } },
        },
      },
    });
    if (!c) throw new NotFoundException("Creator not found");
    return c;
  }

  async updateMyProfile(userId: string, data: Partial<{
    headline: string; bio: string; city: string; country: string;
    coverUrl: string; portfolio: string[]; isAvailable: boolean;
    platforms: any[]; categories: any[]; followersIg: number; followersTt: number; followersYt: number;
  }>) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("No creator profile");
    // Whitelist self-editable fields — never trust the raw body to set
    // rating, mawthooq* verification state, startingPrice, etc.
    const allowed = [
      "headline", "bio", "city", "country", "coverUrl", "portfolio",
      "isAvailable", "platforms", "categories", "followersIg", "followersTt", "followersYt",
    ] as const;
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in data) patch[k] = (data as Record<string, unknown>)[k];
    return this.prisma.creatorProfile.update({ where: { id: profile.id }, data: patch });
  }

  // Creator submits their Mawthooq (GAMR advertising) licence number for review.
  // Resets any prior rejection back to pending; only an admin can move it to
  // verified/rejected (see AdminService). Licence-format and required fields are
  // validated at the controller via Zod.
  async submitMawthooq(userId: string, licenseNo: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("No creator profile");
    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        mawthooqLicenseNo: licenseNo.trim(),
        mawthooqStatus: "pending",
        mawthooqSubmittedAt: new Date(),
        mawthooqReviewNote: null,
      },
      select: { mawthooqStatus: true, mawthooqLicenseNo: true, mawthooqSubmittedAt: true },
    });
  }

  async addPackage(userId: string, input: PackageInput) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException("Not a creator");
    const pkg = await this.prisma.package.create({ data: { ...input, creatorId: profile.id } });
    const min = await this.prisma.package.aggregate({ _min: { price: true }, where: { creatorId: profile.id, isActive: true } });
    if (min._min.price && min._min.price !== profile.startingPrice) {
      await this.prisma.creatorProfile.update({ where: { id: profile.id }, data: { startingPrice: min._min.price } });
    }
    return pkg;
  }

  async deletePackage(userId: string, packageId: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id: packageId }, include: { creator: true } });
    if (!pkg) throw new NotFoundException();
    if (pkg.creator.userId !== userId) throw new ForbiddenException();
    await this.prisma.package.delete({ where: { id: packageId } });
  }

  async toggleSave(userId: string, creatorId: string) {
    const existing = await this.prisma.savedCreator.findUnique({
      where: { userId_creatorId: { userId, creatorId } },
    });
    if (existing) {
      await this.prisma.savedCreator.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await this.prisma.savedCreator.create({ data: { userId, creatorId } });
    return { saved: true };
  }

  async listSaved(userId: string) {
    return this.prisma.savedCreator.findMany({
      where: { userId },
      include: { creator: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
