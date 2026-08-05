import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// Orders whose charge is sitting in PSP escrow: paid, not yet released,
// refunded or cancelled. Disputed funds are frozen, still escrowed.
export const ESCROW_STATUSES: OrderStatus[] = [
  "awaiting_creator",
  "in_progress",
  "submitted",
  "revision_requested",
  "approved",
  "disputed",
];

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private prisma: PrismaService) {}

  // Daily at 03:00 Asia/Riyadh — quiet hours for a KSA marketplace.
  @Cron("0 3 * * *", { name: "daily-reconciliation", timeZone: "Asia/Riyadh" })
  async dailyRun() {
    try {
      const run = await this.run();
      if (run.ok) {
        this.logger.log(`Reconciliation OK — escrow outstanding ${run.escrowOutstanding} SAR`);
      } else {
        this.logger.error(
          `Reconciliation MISMATCH — delta ${run.delta} SAR (ledger escrow ${run.escrowOutstanding} vs order book). Run ${run.id}.`,
        );
      }
    } catch (err) {
      this.logger.error(`Reconciliation run failed: ${err}`);
    }
  }

  /**
   * Ledger-vs-order-book escrow check over ALL ledger entries:
   *   escrowOutstanding = charges - refunds - payouts - commission
   * must equal the sum of (amount + serviceFee) of every order currently in
   * an escrow status. delta != 0 means money is unaccounted for.
   */
  async run() {
    const [ledgerSums, byStatus, firstEntry] = await Promise.all([
      this.prisma.ledgerEntry.groupBy({ by: ["type"], _sum: { amount: true }, _count: true }),
      this.prisma.order.groupBy({
        by: ["status"],
        where: { status: { in: ESCROW_STATUSES } },
        _sum: { amount: true, serviceFee: true },
        _count: true,
      }),
      this.prisma.ledgerEntry.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    ]);

    const sumOf = (type: string) => ledgerSums.find((s) => s.type === type)?._sum.amount ?? 0;
    const moneyIn = sumOf("charge");
    const refunds = sumOf("refund");
    const payouts = sumOf("payout");
    const commission = sumOf("commission");
    const escrowOutstanding = moneyIn - refunds - payouts - commission;

    const expectedEscrow = byStatus.reduce(
      (acc, s) => acc + (s._sum.amount ?? 0) + (s._sum.serviceFee ?? 0),
      0,
    );
    const delta = escrowOutstanding - expectedEscrow;
    const ok = delta === 0;

    const detail: Prisma.InputJsonValue = {
      expectedEscrow,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        orders: s._count,
        amount: s._sum.amount ?? 0,
        serviceFee: s._sum.serviceFee ?? 0,
      })),
      ledger: ledgerSums.map((s) => ({
        type: s.type,
        entries: s._count,
        total: s._sum.amount ?? 0,
      })),
    };

    return this.prisma.reconciliationRun.create({
      data: {
        rangeStart: firstEntry?.createdAt ?? new Date(0),
        rangeEnd: new Date(),
        moneyIn,
        refunds,
        payouts,
        commission,
        escrowOutstanding,
        delta,
        ok,
        detail,
      },
    });
  }

  async list(take = 30) {
    const runs = await this.prisma.reconciliationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(take, 1), 200),
      select: {
        id: true,
        rangeStart: true,
        rangeEnd: true,
        moneyIn: true,
        refunds: true,
        payouts: true,
        commission: true,
        escrowOutstanding: true,
        delta: true,
        ok: true,
        createdAt: true,
      },
    });
    return { runs };
  }
}
