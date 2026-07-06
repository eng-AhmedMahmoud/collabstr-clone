import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CampaignInput, CampaignUpdateInput } from "@collabstr/shared-types";

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

  async byId(id: string, viewerId?: string) {
    // Public endpoint. Applicants' pitches/prices are business-sensitive, so
    // the full list is only attached for the owning brand; everyone else gets
    // the count. Creator/user rows are reduced to display fields.
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!campaign) return null;
    const isOwner = !!viewerId && campaign.brandId === viewerId;
    const applications = isOwner
      ? await this.prisma.application.findMany({
          where: { campaignId: id },
          orderBy: { createdAt: "desc" },
          include: {
            creator: {
              select: {
                id: true, username: true, headline: true, city: true, country: true,
                rating: true, reviewsCount: true, platforms: true, categories: true,
                startingPrice: true,
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        })
      : [];
    return { ...campaign, applications, applicationsCount: campaign._count.applications };
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

  async update(brandId: string, id: string, input: CampaignUpdateInput) {
    const c = await this.prisma.campaign.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.brandId !== brandId) throw new ForbiddenException();
    // Whitelist to campaign fields; ignore anything else in the body.
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.budgetMin !== undefined) data.budgetMin = input.budgetMin;
    if (input.budgetMax !== undefined) data.budgetMax = input.budgetMax;
    if (input.platforms !== undefined) data.platforms = input.platforms;
    if (input.categories !== undefined) data.categories = input.categories;
    if (input.creatorsNeeded !== undefined) data.creatorsNeeded = input.creatorsNeeded;
    if (input.status !== undefined) data.status = input.status;
    if (input.deadline !== undefined) data.deadline = input.deadline ? new Date(input.deadline) : null;
    // Guard the min/max relationship against a partial update that only moves one.
    const budgetMin = (data.budgetMin as number | undefined) ?? c.budgetMin;
    const budgetMax = (data.budgetMax as number | undefined) ?? c.budgetMax;
    if (budgetMax < budgetMin) throw new BadRequestException("budgetMax must be >= budgetMin");
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async remove(brandId: string, id: string) {
    const c = await this.prisma.campaign.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.brandId !== brandId) throw new ForbiddenException();
    await this.prisma.campaign.delete({ where: { id } });
    return { ok: true };
  }
}
