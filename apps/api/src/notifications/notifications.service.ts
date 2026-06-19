import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { type Locale, pickLocalized } from "../common/locale";

type NotificationRow = {
  id: string;
  userId: string;
  kind: string;
  title: unknown;
  body: unknown;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

function localize(row: NotificationRow, locale: Locale) {
  return {
    ...row,
    title: pickLocalized(row.title as any, locale) ?? "",
    body: pickLocalized(row.body as any, locale),
  };
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, locale: Locale) {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => localize(r as unknown as NotificationRow, locale));
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
