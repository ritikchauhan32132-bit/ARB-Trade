import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export type TxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class LedgerService {
  /**
   * Ensure standard wallets (ARB, USDT, INR) exist for user
   */
  static async ensureWallets(userId: string, tx: TxClient = prisma) {
    const currencies = ['ARB', 'USDT', 'INR'];
    for (const curr of currencies) {
      await tx.wallet.upsert({
        where: { userId_currency: { userId, currency: curr } },
        create: {
          userId,
          currency: curr,
          availableBalance: new Decimal(0),
          frozenBalance: new Decimal(0),
        },
        update: {},
      });
    }
  }

  /**
   * Get user wallet by currency
   */
  static async getWallet(userId: string, currency: string, tx: TxClient = prisma) {
    let wallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
          currency,
          availableBalance: new Decimal(0),
          frozenBalance: new Decimal(0),
        },
      });
    }
    return wallet;
  }

  /**
   * Atomic credit to user's available balance with immutable ledger entry
   */
  static async credit(
    {
      userId,
      currency,
      amount,
      fee = 0,
      type,
      referenceId,
      referenceType,
      description,
      idempotencyKey,
    }: {
      userId: string;
      currency: string;
      amount: number | Decimal;
      fee?: number | Decimal;
      type: string;
      referenceId?: string;
      referenceType?: string;
      description: string;
      idempotencyKey?: string;
    },
    tx: TxClient = prisma
  ) {
    const decAmount = new Decimal(amount);
    const decFee = new Decimal(fee);
    if (decAmount.lte(0)) {
      throw new Error('Credit amount must be positive');
    }

    if (idempotencyKey) {
      const existing = await tx.ledgerEntry.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    const wallet = await this.getWallet(userId, currency, tx);
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = balanceBefore.add(decAmount).sub(decFee);

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: balanceAfter },
    });

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        currency,
        type,
        amount: decAmount,
        fee: decFee,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description,
        idempotencyKey,
      },
    });

    return { wallet: updatedWallet, entry };
  }

  /**
   * Atomic debit from user's available balance with balance check and immutable ledger entry
   */
  static async debit(
    {
      userId,
      currency,
      amount,
      fee = 0,
      type,
      referenceId,
      referenceType,
      description,
      idempotencyKey,
    }: {
      userId: string;
      currency: string;
      amount: number | Decimal;
      fee?: number | Decimal;
      type: string;
      referenceId?: string;
      referenceType?: string;
      description: string;
      idempotencyKey?: string;
    },
    tx: TxClient = prisma
  ) {
    const decAmount = new Decimal(amount);
    const decFee = new Decimal(fee);
    const totalDeduction = decAmount.add(decFee);

    if (decAmount.lte(0)) {
      throw new Error('Debit amount must be positive');
    }

    if (idempotencyKey) {
      const existing = await tx.ledgerEntry.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    const wallet = await this.getWallet(userId, currency, tx);
    const balanceBefore = wallet.availableBalance;

    if (balanceBefore.lt(totalDeduction)) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    const balanceAfter = balanceBefore.sub(totalDeduction);

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: balanceAfter },
    });

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        currency,
        type,
        amount: decAmount.negated(),
        fee: decFee,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description,
        idempotencyKey,
      },
    });

    return { wallet: updatedWallet, entry };
  }

  /**
   * Freeze balance (e.g. for sell order escrow or pending withdrawal)
   */
  static async freeze(
    {
      userId,
      currency,
      amount,
      referenceId,
      referenceType,
      description,
    }: {
      userId: string;
      currency: string;
      amount: number | Decimal;
      referenceId?: string;
      referenceType?: string;
      description: string;
    },
    tx: TxClient = prisma
  ) {
    const decAmount = new Decimal(amount);
    if (decAmount.lte(0)) {
      throw new Error('Freeze amount must be positive');
    }

    const wallet = await this.getWallet(userId, currency, tx);
    if (wallet.availableBalance.lt(decAmount)) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    const balanceBefore = wallet.availableBalance;
    const balanceAfter = balanceBefore.sub(decAmount);

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: balanceAfter,
        frozenBalance: wallet.frozenBalance.add(decAmount),
      },
    });

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        currency,
        type: 'FROZEN',
        amount: decAmount.negated(),
        fee: new Decimal(0),
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description,
      },
    });

    return { wallet: updatedWallet, entry };
  }

  /**
   * Unfreeze balance back to available balance (e.g. order cancelled)
   */
  static async unfreeze(
    {
      userId,
      currency,
      amount,
      referenceId,
      referenceType,
      description,
    }: {
      userId: string;
      currency: string;
      amount: number | Decimal;
      referenceId?: string;
      referenceType?: string;
      description: string;
    },
    tx: TxClient = prisma
  ) {
    const decAmount = new Decimal(amount);
    if (decAmount.lte(0)) {
      throw new Error('Unfreeze amount must be positive');
    }

    const wallet = await this.getWallet(userId, currency, tx);
    if (wallet.frozenBalance.lt(decAmount)) {
      throw new Error('INSUFFICIENT_FROZEN_BALANCE');
    }

    const balanceBefore = wallet.availableBalance;
    const balanceAfter = balanceBefore.add(decAmount);

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: balanceAfter,
        frozenBalance: wallet.frozenBalance.sub(decAmount),
      },
    });

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        currency,
        type: 'UNFROZEN',
        amount: decAmount,
        fee: new Decimal(0),
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description,
      },
    });

    return { wallet: updatedWallet, entry };
  }

  /**
   * Release frozen balance (e.g. transferring escrowed funds to buyer upon confirmation)
   */
  static async releaseFrozen(
    {
      fromUserId,
      toUserId,
      currency,
      amount,
      fee = 0,
      referenceId,
      referenceType,
      description,
    }: {
      fromUserId: string;
      toUserId: string;
      currency: string;
      amount: number | Decimal;
      fee?: number | Decimal;
      referenceId?: string;
      referenceType?: string;
      description: string;
    },
    tx: TxClient = prisma
  ) {
    const decAmount = new Decimal(amount);
    const decFee = new Decimal(fee);
    const netAmount = decAmount.sub(decFee);

    if (decAmount.lte(0)) {
      throw new Error('Release amount must be positive');
    }

    // Deduct from seller's frozen balance
    const sellerWallet = await this.getWallet(fromUserId, currency, tx);
    if (sellerWallet.frozenBalance.lt(decAmount)) {
      throw new Error('INSUFFICIENT_FROZEN_BALANCE');
    }

    await tx.wallet.update({
      where: { id: sellerWallet.id },
      data: {
        frozenBalance: sellerWallet.frozenBalance.sub(decAmount),
      },
    });

    // Create seller debit entry
    await tx.ledgerEntry.create({
      data: {
        walletId: sellerWallet.id,
        userId: fromUserId,
        currency,
        type: 'SELL_RELEASE',
        amount: decAmount.negated(),
        fee: decFee,
        balanceBefore: sellerWallet.availableBalance,
        balanceAfter: sellerWallet.availableBalance, // available didn't change because it was already frozen
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description: `Released frozen escrow: ${description}`,
      },
    });

    // Credit buyer available balance
    const buyerWallet = await this.getWallet(toUserId, currency, tx);
    const buyerBalanceBefore = buyerWallet.availableBalance;
    const buyerBalanceAfter = buyerBalanceBefore.add(netAmount);

    await tx.wallet.update({
      where: { id: buyerWallet.id },
      data: {
        availableBalance: buyerBalanceAfter,
      },
    });

    // Create buyer credit entry
    const buyerEntry = await tx.ledgerEntry.create({
      data: {
        walletId: buyerWallet.id,
        userId: toUserId,
        currency,
        type: 'BUY_CREDIT',
        amount: netAmount,
        fee: new Decimal(0),
        balanceBefore: buyerBalanceBefore,
        balanceAfter: buyerBalanceAfter,
        status: 'SUCCESS',
        referenceId,
        referenceType,
        description: `Received trade asset: ${description}`,
      },
    });

    return { sellerWallet, buyerWallet, buyerEntry };
  }
}
export default LedgerService;
