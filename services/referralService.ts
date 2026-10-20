import prisma from '@/lib/prisma';
import LedgerService, { TxClient } from './ledgerService';
import { CONSTANTS } from '@/lib/constants';
import { Decimal } from '@prisma/client/runtime/library';

export class ReferralService {
  /**
   * Distribute 3-tier referral commissions on successful trades
   */
  static async distributeTradeCommission(
    userId: string,
    orderId: string,
    tradeVolume: number | Decimal,
    tx: TxClient = prisma
  ) {
    const decVolume = new Decimal(tradeVolume);
    // Find referral entries for this user
    const referrals = await tx.referral.findMany({
      where: { refereeId: userId },
      include: { referrer: true },
    });

    const rates: Record<number, number> = {
      1: CONSTANTS.REFERRAL_COMMISSION_RATES.TIER_1_PCT,
      2: CONSTANTS.REFERRAL_COMMISSION_RATES.TIER_2_PCT,
      3: CONSTANTS.REFERRAL_COMMISSION_RATES.TIER_3_PCT,
    };

    for (const ref of referrals) {
      const ratePct = rates[ref.tier] || 0;
      if (ratePct > 0) {
        const commissionAmount = decVolume.mul(ratePct).div(100);

        // Record commission in Commission table
        await tx.commission.create({
          data: {
            referrerId: ref.referrerId,
            refereeId: userId,
            orderId,
            tier: ref.tier,
            amount: commissionAmount,
            currency: 'ARB',
            ratePercent: new Decimal(ratePct),
            status: 'APPROVED',
          },
        });

        // Credit to Referrer's ARB Wallet directly
        await LedgerService.credit(
          {
            userId: ref.referrerId,
            currency: 'ARB',
            amount: commissionAmount,
            type: 'REFERRAL_COMMISSION',
            referenceId: orderId,
            referenceType: 'COMMISSION',
            description: `Tier ${ref.tier} team commission from Order #${orderId}`,
            idempotencyKey: `comm_${orderId}_tier${ref.tier}_${ref.referrerId}`,
          },
          tx
        );

        // Notify referrer
        await tx.notification.create({
          data: {
            userId: ref.referrerId,
            title: `Team Commission Received!`,
            content: `You received a ${commissionAmount.toFixed(2)} ARB Tier ${ref.tier} commission from your team member.`,
            type: 'TRANSACTION',
          },
        });
      }
    }
  }

  /**
   * Get team overview and statistics for dashboard
   */
  static async getTeamSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referralsGiven: {
          include: {
            referee: {
              include: {
                wallets: true,
              },
            },
          },
        },
        commissionsEarned: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const tier1 = user.referralsGiven.filter((r) => r.tier === 1);
    const tier2 = user.referralsGiven.filter((r) => r.tier === 2);
    const tier3 = user.referralsGiven.filter((r) => r.tier === 3);

    const totalCommission = user.commissionsEarned.reduce(
      (acc, c) => acc.add(c.amount),
      new Decimal(0)
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCommission = user.commissionsEarned
      .filter((c) => c.createdAt >= startOfToday)
      .reduce((acc, c) => acc.add(c.amount), new Decimal(0));

    return {
      inviteCode: user.inviteCode,
      totalCommission: totalCommission.toNumber(),
      todayCommission: todayCommission.toNumber(),
      tier1Count: tier1.length,
      tier2Count: tier2.length,
      tier3Count: tier3.length,
      totalTeamCount: user.referralsGiven.length,
      members: user.referralsGiven.map((r) => ({
        id: r.referee.id,
        username: r.referee.username,
        tier: r.tier,
        joinedAt: r.createdAt,
        arbBalance: r.referee.wallets.find((w) => w.currency === 'ARB')?.availableBalance.toNumber() || 0,
      })),
      recentCommissions: user.commissionsEarned.slice(0, 20).map((c) => ({
        id: c.id,
        amount: c.amount.toNumber(),
        currency: c.currency,
        tier: c.tier,
        createdAt: c.createdAt,
      })),
    };
  }
}
export default ReferralService;
