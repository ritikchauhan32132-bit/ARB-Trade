import prisma from '@/lib/prisma';
import LedgerService from './ledgerService';
import ReferralService from './referralService';
import { CONSTANTS } from '@/lib/constants';
import { generateOrderNumber } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderService {
  /**
   * Create Buy ARB / Cashier Recharge Order
   */
  static async createBuyOrder(userId: string, fiatAmount: number, paymentMethod: string) {
    if (fiatAmount < CONSTANTS.TRADING_LIMITS.MIN_BUY_INR || fiatAmount > CONSTANTS.TRADING_LIMITS.MAX_BUY_INR) {
      throw new Error(`Buy amount must be between ₹${CONSTANTS.TRADING_LIMITS.MIN_BUY_INR} and ₹${CONSTANTS.TRADING_LIMITS.MAX_BUY_INR}`);
    }

    const rate = CONSTANTS.RATES.ARB_TO_INR; // 100 INR per 1 ARB
    const tokenAmount = new Decimal(fiatAmount).div(rate);
    const orderNumber = generateOrderNumber('BUY');
    const expiresAt = new Date(Date.now() + CONSTANTS.TRADING_LIMITS.BUY_ORDER_TIMEOUT_MINUTES * 60 * 1000);

    // Find an active Cashier or System Payee
    const cashier = await prisma.user.findFirst({
      where: { role: 'CASHIER', status: 'ACTIVE' },
      include: { collectionMethods: { where: { isDefault: true } } },
    });

    const defaultPayeeUpi = cashier?.collectionMethods[0]?.upiId || 'arwallet.pay@icici';
    const defaultPayeeName = cashier?.collectionMethods[0]?.realName || 'AR WALLET CASHIER';
    const defaultPayeeBank = cashier?.collectionMethods[0]?.bankName || 'HDFC Bank';
    const defaultPayeeAccount = cashier?.collectionMethods[0]?.accountNumber || '50200098765432';
    const defaultPayeeIfsc = cashier?.collectionMethods[0]?.ifscCode || 'HDFC0001234';

    const order = await prisma.order.create({
      data: {
        orderNumber,
        type: 'BUY',
        status: 'PENDING_PAYMENT',
        buyerId: userId,
        sellerId: cashier?.id || null,
        fiatCurrency: 'INR',
        fiatAmount: new Decimal(fiatAmount),
        tokenCurrency: 'ARB',
        tokenAmount,
        unitPrice: new Decimal(rate),
        paymentMethod,
        payeeUpi: defaultPayeeUpi,
        payeeName: defaultPayeeName,
        payeeBank: defaultPayeeBank,
        payeeAccount: defaultPayeeAccount,
        payeeIfsc: defaultPayeeIfsc,
        expiresAt,
      },
    });

    return order;
  }

  /**
   * Buyer confirms fiat payment by submitting UTR
   */
  static async confirmPayment(orderId: string, userId: string, utrNumber: string, proofImageUrl?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');
    if (order.buyerId !== userId) throw new Error('Unauthorized');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error(`Order is not in pending payment state (current status: ${order.status})`);
    }

    if (new Date() > order.expiresAt) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'TIMEOUT' },
      });
      throw new Error('Order has timed out');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID_BY_BUYER',
        utrNumber,
        proofImageUrl: proofImageUrl || null,
      },
    });

    // Notify Cashier / Admin
    if (order.sellerId) {
      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          title: `Buyer Paid for Order #${order.orderNumber}`,
          content: `Buyer has submitted UTR: ${utrNumber}. Please verify payment arrival.`,
          type: 'ORDER',
          linkUrl: `/order/detail?id=${order.id}`,
        },
      });
    }

    return updated;
  }

  /**
   * Cashier / System approves and completes Buy Order, crediting buyer wallet atomically
   */
  static async completeBuyOrder(orderId: string, reviewerId?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('Order not found');
      if (order.status === 'COMPLETED') throw new Error('Order already completed');
      if (!order.buyerId) throw new Error('Invalid buyer on order');

      // Credit buyer wallet
      await LedgerService.credit(
        {
          userId: order.buyerId,
          currency: order.tokenCurrency,
          amount: order.tokenAmount,
          type: 'BUY_CREDIT',
          referenceId: order.id,
          referenceType: 'ORDER',
          description: `Buy Order #${order.orderNumber} fulfilled`,
          idempotencyKey: `buy_order_complete_${order.id}`,
        },
        tx
      );

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Distribute referral commission
      await ReferralService.distributeTradeCommission(
        order.buyerId,
        order.id,
        order.tokenAmount,
        tx
      );

      // Notify Buyer
      await tx.notification.create({
        data: {
          userId: order.buyerId,
          title: `Buy Order Completed #${order.orderNumber}`,
          content: `Your payment was verified and ${order.tokenAmount} ${order.tokenCurrency} has been credited to your wallet.`,
          type: 'ORDER',
          linkUrl: `/wallet`,
        },
      });

      return updated;
    });
  }

  /**
   * Create Sell ARB / C2C Sell Out Order
   */
  static async createSellOrder(
    userId: string,
    tokenAmount: number,
    collectionMethodId: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { collectionMethods: true },
    });

    if (!user) throw new Error('User not found');
    if (!user.canSell) throw new Error('Your selling privileges are currently disabled. Please contact support.');

    const collection = user.collectionMethods.find((c) => c.id === collectionMethodId);
    if (!collection) throw new Error('Selected collection method not found');

    if (collection.type === 'UPI' && user.upiBanned) {
      throw new Error('Your UPI collection channel is currently restricted. Please use Bank Account.');
    }

    if (tokenAmount < CONSTANTS.TRADING_LIMITS.MIN_SELL_ARB || tokenAmount > CONSTANTS.TRADING_LIMITS.MAX_SELL_ARB) {
      throw new Error(`Sell amount must be between ${CONSTANTS.TRADING_LIMITS.MIN_SELL_ARB} and ${CONSTANTS.TRADING_LIMITS.MAX_SELL_ARB} ARB`);
    }

    const rate = CONSTANTS.RATES.ARB_TO_INR;
    const fiatAmount = new Decimal(tokenAmount).mul(rate);
    const orderNumber = generateOrderNumber('SELL');
    const expiresAt = new Date(Date.now() + CONSTANTS.TRADING_LIMITS.SELL_ORDER_TIMEOUT_MINUTES * 60 * 1000);

    return await prisma.$transaction(async (tx) => {
      // 1. Freeze tokens in seller's wallet atomically
      await LedgerService.freeze(
        {
          userId,
          currency: 'ARB',
          amount: tokenAmount,
          referenceType: 'ORDER',
          description: `Escrow lock for Sell Order #${orderNumber}`,
        },
        tx
      );

      // 2. Create Sell Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          type: 'SELL',
          status: 'PENDING_PAYMENT',
          sellerId: userId,
          fiatCurrency: 'INR',
          fiatAmount,
          tokenCurrency: 'ARB',
          tokenAmount: new Decimal(tokenAmount),
          unitPrice: new Decimal(rate),
          paymentMethod: collection.type,
          payeeUpi: collection.upiId,
          payeeName: collection.realName,
          payeeBank: collection.bankName,
          payeeAccount: collection.accountNumber,
          payeeIfsc: collection.ifscCode,
          expiresAt,
        },
      });

      return order;
    });
  }

  /**
   * Seller confirms receipt of fiat payment and releases frozen ARB to Buyer
   */
  static async confirmArrival(orderId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('Order not found');
      if (order.sellerId !== userId) throw new Error('Unauthorized');
      if (order.status === 'COMPLETED') throw new Error('Order already completed');

      // If there is an assigned buyer, transfer to buyer, otherwise release from system
      if (order.buyerId) {
        await LedgerService.releaseFrozen(
          {
            fromUserId: order.sellerId,
            toUserId: order.buyerId,
            currency: order.tokenCurrency,
            amount: order.tokenAmount,
            referenceId: order.id,
            referenceType: 'ORDER',
            description: `Sell Order #${order.orderNumber} settled`,
          },
          tx
        );
      } else {
        // System liquidity buyback
        const sellerWallet = await LedgerService.getWallet(order.sellerId, order.tokenCurrency, tx);
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: {
            frozenBalance: sellerWallet.frozenBalance.sub(order.tokenAmount),
          },
        });

        await tx.ledgerEntry.create({
          data: {
            walletId: sellerWallet.id,
            userId: order.sellerId,
            currency: order.tokenCurrency,
            type: 'SELL_RELEASE',
            amount: order.tokenAmount.negated(),
            balanceBefore: sellerWallet.availableBalance,
            balanceAfter: sellerWallet.availableBalance,
            status: 'SUCCESS',
            referenceId: order.id,
            referenceType: 'ORDER',
            description: `Sell Order #${order.orderNumber} settled to Cashier Pool`,
          },
        });
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Distribute referral commission on trade completion
      await ReferralService.distributeTradeCommission(
        order.sellerId,
        order.id,
        order.tokenAmount,
        tx
      );

      return updated;
    });
  }

  /**
   * Cancel order and unfreeze balance if applicable
   */
  static async cancelOrder(orderId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('Order not found');
      if (order.buyerId !== userId && order.sellerId !== userId) throw new Error('Unauthorized');
      if (order.status === 'COMPLETED') throw new Error('Cannot cancel completed order');
      if (order.status === 'CANCELLED') throw new Error('Order already cancelled');

      // If it's a SELL order and funds were frozen, unfreeze them back to seller
      if (order.type === 'SELL' && order.sellerId) {
        await LedgerService.unfreeze(
          {
            userId: order.sellerId,
            currency: order.tokenCurrency,
            amount: order.tokenAmount,
            referenceId: order.id,
            referenceType: 'ORDER',
            description: `Refund frozen escrow on cancelled order #${order.orderNumber}`,
          },
          tx
        );
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });

      return updated;
    });
  }

  /**
   * Submit Dispute / Appeal
   */
  static async submitAppeal(
    orderId: string,
    userId: string,
    type: string,
    reason: string,
    proofImageUrl?: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.buyerId !== userId && order.sellerId !== userId) throw new Error('Unauthorized');

    const appeal = await prisma.orderAppeal.create({
      data: {
        orderId,
        userId,
        type,
        reason,
        proofImageUrl: proofImageUrl || null,
        status: 'PENDING',
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'APPEALED',
        appealReason: reason,
        appealStatus: 'PENDING',
      },
    });

    return appeal;
  }
}
export default OrderService;
