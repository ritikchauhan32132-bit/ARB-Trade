import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import WalletService from '@/services/walletService';
import AuthService from '@/services/authService';
import { USDTWithdrawalSchema } from '@/validators';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return jsonSuccess(withdrawals);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch withdrawals', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = USDTWithdrawalSchema.parse(body);

    const isPinValid = await AuthService.verifyPaymentPin(user.id, validated.paymentPin);
    if (!isPinValid) {
      return jsonError('Invalid Payment PIN');
    }

    const withdrawal = await WalletService.requestUSDTWithdrawal(user.id, {
      network: validated.network,
      address: validated.address,
      amount: validated.amount,
    });

    return jsonSuccess(withdrawal, 'Withdrawal request submitted successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Withdrawal request failed');
  }
}
