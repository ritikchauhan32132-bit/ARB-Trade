import prisma from '@/lib/prisma';
import LedgerService from './ledgerService';
import { CONSTANTS } from '@/lib/constants';
import { Decimal } from '@prisma/client/runtime/library';

export class WalletService {
  /**
   * Get all user balances and aggregate valuation
   */
  static async getBalances(userId: string) {
    await LedgerService.ensureWallets(userId);
    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    const arbWallet = wallets.find((w) => w.currency === 'ARB') || { availableBalance: new Decimal(0), frozenBalance: new Decimal(0) };
    const usdtWallet = wallets.find((w) => w.currency === 'USDT') || { availableBalance: new Decimal(0), frozenBalance: new Decimal(0) };
    const inrWallet = wallets.find((w) => w.currency === 'INR') || { availableBalance: new Decimal(0), frozenBalance: new Decimal(0) };

    const arbValuationINR = arbWallet.availableBalance.add(arbWallet.frozenBalance).mul(CONSTANTS.RATES.ARB_TO_INR);
    const usdtValuationINR = usdtWallet.availableBalance.add(usdtWallet.frozenBalance).mul(CONSTANTS.RATES.USDT_TO_INR);
    const totalValuationINR = arbValuationINR.add(usdtValuationINR).add(inrWallet.availableBalance);
    const totalValuationUSDT = totalValuationINR.div(CONSTANTS.RATES.USDT_TO_INR);

    return {
      totalValuationINR: totalValuationINR.toNumber(),
      totalValuationUSDT: totalValuationUSDT.toNumber(),
      arb: {
        available: arbWallet.availableBalance.toNumber(),
        frozen: arbWallet.frozenBalance.toNumber(),
        total: arbWallet.availableBalance.add(arbWallet.frozenBalance).toNumber(),
      },
      usdt: {
        available: usdtWallet.availableBalance.toNumber(),
        frozen: usdtWallet.frozenBalance.toNumber(),
        total: usdtWallet.availableBalance.add(usdtWallet.frozenBalance).toNumber(),
      },
      inr: {
        available: inrWallet.availableBalance.toNumber(),
        frozen: inrWallet.frozenBalance.toNumber(),
        total: inrWallet.availableBalance.add(inrWallet.frozenBalance).toNumber(),
      },
    };
  }

  /**
   * Submit USDT Recharge / On-Chain Deposit
   */
  static async submitUSDTDeposit(userId: string, data: {
    network: string;
    amount: number;
    txHash: string;
    proofImageUrl?: string;
  }) {
    const existing = await prisma.deposit.findFirst({
      where: { txHash: data.txHash },
    });

    if (existing) {
      throw new Error('This transaction hash has already been submitted');
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        currency: 'USDT',
        amount: new Decimal(data.amount),
        fee: new Decimal(0),
        netAmount: new Decimal(data.amount),
        network: data.network,
        toAddress: data.network === 'TRC20' ? process.env.USDT_TRC20_DEPOSIT_ADDRESS : process.env.USDT_ERC20_DEPOSIT_ADDRESS,
        txHash: data.txHash,
        proofImageUrl: data.proofImageUrl || null,
        status: 'PENDING',
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'USDT Deposit Submitted',
        content: `Your deposit of ${data.amount} USDT (${data.network}) has been received and is pending blockchain confirmation.`,
        type: 'TRANSACTION',
      },
    });

    return deposit;
  }

  /**
   * Request USDT Withdrawal
   */
  static async requestUSDTWithdrawal(userId: string, data: {
    network: string;
    address: string;
    amount: number;
  }) {
    if (data.amount < CONSTANTS.TRADING_LIMITS.MIN_WITHDRAW_USDT) {
      throw new Error(`Minimum withdrawal is ${CONSTANTS.TRADING_LIMITS.MIN_WITHDRAW_USDT} USDT`);
    }

    const fee = new Decimal(CONSTANTS.TRADING_LIMITS.WITHDRAW_FEE_USDT);
    const netAmount = new Decimal(data.amount).sub(fee);

    return await prisma.$transaction(async (tx) => {
      // Debit user available USDT balance atomically
      await LedgerService.debit(
        {
          userId,
          currency: 'USDT',
          amount: data.amount,
          fee: 0,
          type: 'WITHDRAWAL',
          referenceType: 'WITHDRAWAL',
          description: `USDT Withdrawal to ${data.address} (${data.network})`,
        },
        tx
      );

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          currency: 'USDT',
          amount: new Decimal(data.amount),
          fee,
          netAmount,
          network: data.network,
          destinationAddress: data.address,
          status: 'PENDING',
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Withdrawal Processing',
          content: `Your withdrawal request for ${data.amount} USDT is being processed by security nodes.`,
          type: 'TRANSACTION',
        },
      });

      return withdrawal;
    });
  }

  /**
   * Get transaction history / ledger statement
   */
  static async getTransactions(userId: string, page = 1, limit = 20, currency?: string, type?: string) {
    const where: any = { userId };
    if (currency && currency !== 'ALL') {
      where.currency = currency;
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ledgerEntry.count({ where }),
    ]);

    return {
      items: entries.map((e) => ({
        id: e.id,
        currency: e.type.includes('INR') ? 'INR' : e.currency,
        type: e.type,
        amount: e.amount.toNumber(),
        fee: e.fee.toNumber(),
        balanceAfter: e.balanceAfter.toNumber(),
        status: e.status,
        description: e.description,
        createdAt: e.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
export default WalletService;
