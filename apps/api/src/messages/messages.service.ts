import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async listThreads(userId: string) {
    return this.prisma.thread.findMany({
      where: { OR: [{ brandId: userId }, { creatorUserId: userId }] },
      include: {
        brand: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  async messages(userId: string, threadId: string) {
    const thread = await this.prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException();
    if (thread.brandId !== userId && thread.creatorUserId !== userId) throw new ForbiddenException();
    return this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
  }

  async send(userId: string, threadId: string, body: string) {
    const thread = await this.prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException();
    if (thread.brandId !== userId && thread.creatorUserId !== userId) throw new ForbiddenException();
    const [msg] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { threadId, senderId: userId, body } }),
      this.prisma.thread.update({ where: { id: threadId }, data: { lastMessageAt: new Date() } }),
    ]);
    return msg;
  }

  async openThread(brandUserId: string, creatorUsername: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { username: creatorUsername },
      include: { user: true },
    });
    if (!creator) throw new NotFoundException();
    return this.prisma.thread.upsert({
      where: { brandId_creatorUserId: { brandId: brandUserId, creatorUserId: creator.userId } },
      create: { brandId: brandUserId, creatorUserId: creator.userId, creatorProfileId: creator.id },
      update: {},
    });
  }

  async markRead(userId: string, threadId: string) {
    return this.prisma.message.updateMany({
      where: { threadId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
