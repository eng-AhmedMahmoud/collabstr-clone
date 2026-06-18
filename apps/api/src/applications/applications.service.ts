import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(creatorUserId: string, campaignId: string, price: number, pitch: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorUserId } });
    if (!profile) throw new ForbiddenException("Not a creator");
    return this.prisma.application.upsert({
      where: { campaignId_creatorId: { campaignId, creatorId: profile.id } },
      create: { campaignId, creatorId: profile.id, price, pitch },
      update: { price, pitch, status: "pending" },
    });
  }

  async mine(creatorUserId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorUserId } });
    if (!profile) return [];
    return this.prisma.application.findMany({
      where: { creatorId: profile.id },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async setStatus(brandUserId: string, applicationId: string, status: "accepted" | "rejected") {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true },
    });
    if (!app) throw new NotFoundException();
    if (app.campaign.brandId !== brandUserId) throw new ForbiddenException();
    return this.prisma.application.update({ where: { id: applicationId }, data: { status } });
  }

  async withdraw(creatorUserId: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { creator: true },
    });
    if (!app) throw new NotFoundException();
    if (app.creator.userId !== creatorUserId) throw new ForbiddenException();
    return this.prisma.application.update({ where: { id: applicationId }, data: { status: "withdrawn" } });
  }
}
