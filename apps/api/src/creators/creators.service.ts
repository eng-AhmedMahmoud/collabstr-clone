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
    return this.prisma.creatorProfile.update({ where: { id: profile.id }, data });
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
