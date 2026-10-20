import prisma from '@/lib/prisma';
import LedgerService from './ledgerService';
import OrderService from './orderService';
import { Decimal } from '@prisma/client/runtime/library';

export class AdminService {
  /**
   * Get system wide dashboard metrics
   */
  static async getDashboardMetrics() {
    const [
      totalUsers,
      totalOrders,
      pendingDeposits,
      pendingWithdrawals,
      pendingKycs,
      pendingAppeals,
      wallets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.kycRecord.count({ where: { status: 'PENDING' } }),
      prisma.orderAppeal.count({ where: { status: 'PENDING' } }),
      prisma.wallet.findMany(),
    ]);

    const totalArb = wallets
      .filter((w) => w.currency === 'ARB')
      .reduce((acc, w) => acc.add(w.availableBalance).add(w.frozenBalance), new Decimal(0));

    const totalUsdt = wallets
      .filter((w) => w.currency === 'USDT')
      .reduce((acc, w) => acc.add(w.availableBalance).add(w.frozenBalance), new Decimal(0));

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { buyer: true, seller: true },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalUsers,
      totalOrders,
      pendingDeposits,
      pendingWithdrawals,
      pendingKycs,
      pendingAppeals,
      systemLiabilities: {
        arb: totalArb.toNumber(),
        usdt: totalUsdt.toNumber(),
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        type: o.type,
        status: o.status,
        fiatAmount: o.fiatAmount.toNumber(),
        tokenAmount: o.tokenAmount.toNumber(),
        buyer: o.buyer?.username || '—',
        seller: o.seller?.username || '—',
        createdAt: o.createdAt,
      })),
      recentAuditLogs,
    };
  }

  /**
   * Search and filter users
   */
  static async getUsers(page = 1, limit = 20, search?: string, status?: string, role?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { inviteCode: { contains: search } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallets: true,
          collectionMethods: true,
          kycRecords: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        status: u.status,
        role: u.role,
        kycLevel: u.kycLevel,
        kycStatus: u.kycStatus,
        vipLevel: u.vipLevel,
        canSell: u.canSell,
        upiBanned: u.upiBanned,
        inviteCode: u.inviteCode,
        createdAt: u.createdAt,
        wallets: u.wallets.map((w) => ({
          currency: w.currency,
          available: w.availableBalance.toNumber(),
          frozen: w.frozenBalance.toNumber(),
        })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user status (Freeze, Unfreeze, Toggle selling, Toggle UPI ban)
   */
  static async updateUserStatus(
    targetUserId: string,
    adminId: string,
    data: {
      status?: string;
      canSell?: boolean;
      upiBanned?: boolean;
      role?: string;
      vipLevel?: number;
      reason: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(typeof data.canSell === 'boolean' ? { canSell: data.canSell } : {}),
        ...(typeof data.upiBanned === 'boolean' ? { upiBanned: data.upiBanned } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(typeof data.vipLevel === 'number' ? { vipLevel: data.vipLevel } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'UPDATE_USER_STATUS',
        resource: 'USER',
        resourceId: targetUserId,
        beforeState: JSON.stringify({ status: user.status, canSell: user.canSell, upiBanned: user.upiBanned }),
        afterState: JSON.stringify({ status: updated.status, canSell: updated.canSell, upiBanned: updated.upiBanned }),
        reason: data.reason,
      },
    });

    return updated;
  }

  /**
   * Review KYC
   */
  static async reviewKyc(
    kycId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) {
    const kyc = await prisma.kycRecord.findUnique({ where: { id: kycId } });
    if (!kyc) throw new Error('KYC record not found');

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.kycRecord.update({
        where: { id: kycId },
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejectionReason: action === 'REJECT' ? rejectionReason : null,
          reviewerId: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: kyc.userId },
        data: {
          kycStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          kycLevel: action === 'APPROVE' ? 2 : 0,
        },
      });

      await tx.notification.create({
        data: {
          userId: kyc.userId,
          title: action === 'APPROVE' ? 'KYC Verification Approved!' : 'KYC Verification Rejected',
          content:
            action === 'APPROVE'
              ? 'Congratulations! Your identity verification has been approved. You now enjoy Tier 2 limits.'
              : `Your KYC submission was rejected. Reason: ${rejectionReason || 'Document unreadable'}. Please resubmit in Security Center.`,
          type: 'SECURITY',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          action: `KYC_${action}`,
          resource: 'KYC_RECORD',
          resourceId: kycId,
          reason: rejectionReason || 'Compliance review',
        },
      });

      return updated;
    });
  }

  /**
   * Review Deposit (USDT)
   */
  static async reviewDeposit(
    depositId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) {
    const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== 'PENDING') throw new Error(`Deposit already processed (${deposit.status})`);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejectionReason: action === 'REJECT' ? rejectionReason : null,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
      });

      if (action === 'APPROVE') {
        await LedgerService.credit(
          {
            userId: deposit.userId,
            currency: deposit.currency,
            amount: deposit.amount,
            type: 'DEPOSIT',
            referenceId: deposit.id,
            referenceType: 'DEPOSIT',
            description: `USDT Recharge Approved (TxHash: ${deposit.txHash})`,
            idempotencyKey: `deposit_approve_${deposit.id}`,
          },
          tx
        );
      }

      await tx.notification.create({
        data: {
          userId: deposit.userId,
          title: action === 'APPROVE' ? 'Deposit Approved' : 'Deposit Rejected',
          content:
            action === 'APPROVE'
              ? `Your deposit of ${deposit.amount} ${deposit.currency} has been credited to your wallet.`
              : `Your deposit request was rejected. Reason: ${rejectionReason || 'Invalid transaction hash'}`,
          type: 'TRANSACTION',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          action: `DEPOSIT_${action}`,
          resource: 'DEPOSIT',
          resourceId: depositId,
          reason: rejectionReason || 'Deposit audit',
        },
      });

      return updated;
    });
  }

  /**
   * Review Withdrawal (USDT)
   */
  static async reviewWithdrawal(
    withdrawalId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) {
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'PENDING') throw new Error(`Withdrawal already processed (${withdrawal.status})`);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejectionReason: action === 'REJECT' ? rejectionReason : null,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
      });

      // If rejected, refund balance back to user's wallet atomically
      if (action === 'REJECT') {
        await LedgerService.credit(
          {
            userId: withdrawal.userId,
            currency: withdrawal.currency,
            amount: withdrawal.amount,
            type: 'SYSTEM_ADJUSTMENT',
            referenceId: withdrawal.id,
            referenceType: 'WITHDRAWAL_REFUND',
            description: `Refund for rejected withdrawal #${withdrawal.id}`,
            idempotencyKey: `withdrawal_reject_${withdrawal.id}`,
          },
          tx
        );
      }

      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          title: action === 'APPROVE' ? 'Withdrawal Dispatched' : 'Withdrawal Rejected',
          content:
            action === 'APPROVE'
              ? `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been processed on-chain.`
              : `Your withdrawal request was rejected and funds returned. Reason: ${rejectionReason || 'Compliance review'}`,
          type: 'TRANSACTION',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          action: `WITHDRAWAL_${action}`,
          resource: 'WITHDRAWAL',
          resourceId: withdrawalId,
          reason: rejectionReason || 'Withdrawal audit',
        },
      });

      return updated;
    });
  }

  /**
   * Resolve C2C Dispute / Appeal
   */
  static async resolveAppeal(
    appealId: string,
    adminId: string,
    resolution: 'RELEASE_TO_BUYER' | 'CANCEL_AND_REFUND_SELLER',
    adminNote: string
  ) {
    const appeal = await prisma.orderAppeal.findUnique({
      where: { id: appealId },
      include: { order: true },
    });

    if (!appeal) throw new Error('Appeal not found');

    return await prisma.$transaction(async (tx) => {
      await tx.orderAppeal.update({
        where: { id: appealId },
        data: {
          status: 'RESOLVED',
          adminNote,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });

      if (resolution === 'RELEASE_TO_BUYER') {
        if (appeal.order.type === 'BUY') {
          await OrderService.completeBuyOrder(appeal.order.id, adminId);
        } else if (appeal.order.sellerId && appeal.order.buyerId) {
          await LedgerService.releaseFrozen(
            {
              fromUserId: appeal.order.sellerId,
              toUserId: appeal.order.buyerId,
              currency: appeal.order.tokenCurrency,
              amount: appeal.order.tokenAmount,
              referenceId: appeal.order.id,
              referenceType: 'DISPUTE_RESOLUTION',
              description: `Dispute resolved in buyer favor #${appeal.order.orderNumber}`,
            },
            tx
          );
          await tx.order.update({
            where: { id: appeal.order.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          });
        }
      } else {
        // Refund seller
        if (appeal.order.sellerId) {
          await LedgerService.unfreeze(
            {
              userId: appeal.order.sellerId,
              currency: appeal.order.tokenCurrency,
              amount: appeal.order.tokenAmount,
              referenceId: appeal.order.id,
              referenceType: 'DISPUTE_RESOLUTION',
              description: `Dispute resolved in seller favor #${appeal.order.orderNumber}`,
            },
            tx
          );
        }
        await tx.order.update({
          where: { id: appeal.order.id },
          data: { status: 'CANCELLED' },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          action: 'DISPUTE_RESOLVED',
          resource: 'ORDER_APPEAL',
          resourceId: appealId,
          reason: `${resolution}: ${adminNote}`,
        },
      });

      return { success: true };
    });
  }

  /**
   * Manual Ledger Adjustment with mandatory audit trail
   */
  static async manualAdjustment(
    adminId: string,
    targetUserId: string,
    currency: string,
    amount: number,
    reason: string
  ) {
    if (amount === 0) throw new Error('Amount cannot be zero');

    return await prisma.$transaction(async (tx) => {
      let result;
      if (amount > 0) {
        result = await LedgerService.credit(
          {
            userId: targetUserId,
            currency,
            amount,
            type: 'SYSTEM_ADJUSTMENT',
            referenceId: adminId,
            referenceType: 'ADMIN_MANUAL_ADJUSTMENT',
            description: `Manual adjustment credit: ${reason}`,
          },
          tx
        );
      } else {
        result = await LedgerService.debit(
          {
            userId: targetUserId,
            currency,
            amount: Math.abs(amount),
            type: 'SYSTEM_ADJUSTMENT',
            referenceId: adminId,
            referenceType: 'ADMIN_MANUAL_ADJUSTMENT',
            description: `Manual adjustment debit: ${reason}`,
          },
          tx
        );
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          action: 'MANUAL_BALANCE_ADJUSTMENT',
          resource: 'WALLET',
          resourceId: targetUserId,
          reason: `Currency: ${currency}, Amount: ${amount}. Justification: ${reason}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: 'Balance Adjustment Notice',
          content: `A system balance adjustment of ${amount > 0 ? '+' : ''}${amount} ${currency} was applied. Reason: ${reason}`,
          type: 'SYSTEM',
        },
      });

      return result;
    });
  }
}
export default AdminService;
