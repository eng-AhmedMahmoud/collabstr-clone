import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CampaignInput } from "@collabstr/shared-types";

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  list(query: { platform?: string; category?: string; status?: string }) {
    const where: any = { status: query.status ?? "open" };
    if (query.platform) where.platforms = { has: query.platform };
    if (query.category) where.categories = { has: query.category };
    return this.prisma.campaign.findMany({
      where,
      include: { brand: { select: { name: true, avatarUrl: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  byId(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true, avatarUrl: true } },
        applications: { include: { creator: { include: { user: true } } } },
      },
    });
  }

  myCampaigns(brandId: string) {
    return this.prisma.campaign.findMany({
      where: { brandId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  create(brandId: string, input: CampaignInput) {
    return this.prisma.campaign.create({
      data: {
        brandId,
        title: input.title,
        description: input.description,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        platforms: input.platforms,
        categories: input.categories,
        creatorsNeeded: input.creatorsNeeded ?? 1,
        deadline: input.deadline ? new Date(input.deadline) : null,
      },
    });
  }

  async setStatus(brandId: string, id: string, status: "open" | "closed" | "draft") {
    const c = await this.prisma.campaign.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.brandId !== brandId) throw new ForbiddenException();
    return this.prisma.campaign.update({ where: { id }, data: { status } });
  }
}
