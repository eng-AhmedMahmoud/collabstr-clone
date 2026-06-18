import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async leave(brandUserId: string, orderId: string, rating: number, text: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException("Rating must be 1–5");
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.brandId !== brandUserId) throw new ForbiddenException();
    if (order.status !== "released") throw new BadRequestException("Order must be released");

    const review = await this.prisma.review.upsert({
      where: { orderId },
      create: { orderId, authorId: brandUserId, creatorId: order.creatorId, rating, text },
      update: { rating, text },
    });
    const agg = await this.prisma.review.aggregate({
      where: { creatorId: order.creatorId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.creatorProfile.update({
      where: { id: order.creatorId },
      data: { rating: Number((agg._avg.rating ?? 5).toFixed(2)), reviewsCount: agg._count },
    });
    return review;
  }

  byCreator(creatorId: string) {
    return this.prisma.review.findMany({
      where: { creatorId },
      include: { author: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
