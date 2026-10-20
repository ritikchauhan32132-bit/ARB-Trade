import { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';
import OrderService from '@/services/orderService';
import LedgerService from '@/services/ledgerService';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const { eventId, eventType, orderId, status, amount, txHash } = event;

    if (!eventId) {
      return jsonError('Missing eventId', 'INVALID_EVENT', 400);
    }

    // 1. Idempotency check
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existing && existing.processed) {
      return jsonSuccess({ duplicate: true }, 'Event already processed');
    }

    // Store incoming webhook event
    await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        provider: 'PAYMENT_GATEWAY',
        eventId,
        eventType: eventType || 'PAYMENT_STATUS_UPDATE',
        payload: rawBody,
        signature: signature || null,
        processed: false,
      },
      update: {},
    });

    // Process event atomically
    if (eventType === 'ORDER_PAYMENT_SUCCESS' && orderId) {
      await OrderService.completeBuyOrder(orderId);
    } else if (eventType === 'USDT_DEPOSIT_CONFIRMED' && txHash) {
      const deposit = await prisma.deposit.findFirst({
        where: { txHash, status: 'PENDING' },
      });
      if (deposit) {
        await LedgerService.credit({
          userId: deposit.userId,
          currency: 'USDT',
          amount: deposit.amount,
          type: 'DEPOSIT',
          referenceId: deposit.id,
          referenceType: 'WEBHOOK_DEPOSIT',
          description: `USDT Deposit confirmed via on-chain webhook (Tx: ${txHash})`,
          idempotencyKey: `webhook_usdt_${txHash}`,
        });
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: { status: 'APPROVED', reviewedAt: new Date() },
        });
      }
    }

    await prisma.webhookEvent.update({
      where: { eventId },
      data: { processed: true, processedAt: new Date() },
    });

    return jsonSuccess({ processed: true }, 'Webhook processed successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Webhook processing failed', 'WEBHOOK_ERROR', 500);
  }
}
