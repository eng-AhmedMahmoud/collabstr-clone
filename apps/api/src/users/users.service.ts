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
}
