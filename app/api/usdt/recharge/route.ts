import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import WalletService from '@/services/walletService';
import { USDTRechargeSubmitSchema } from '@/validators';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const deposits = await prisma.deposit.findMany({
      where: { userId: user.id, currency: 'USDT' },
      orderBy: { createdAt: 'desc' },
    });
    return jsonSuccess({
      trc20Address: process.env.USDT_TRC20_DEPOSIT_ADDRESS || 'TX7kR4Zp9eW2Yn6Mb8v3QqL1s0Cd5Ef8Gh',
      erc20Address: process.env.USDT_ERC20_DEPOSIT_ADDRESS || '0x71C836067b5e43a9019623eE0C06A91187d9A3bc',
      history: deposits,
    });
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch deposit details', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = USDTRechargeSubmitSchema.parse(body);

    const deposit = await WalletService.submitUSDTDeposit(user.id, validated);
    return jsonSuccess(deposit, 'USDT Recharge submitted successfully and is pending confirmation');
  } catch (err: any) {
    return jsonError(err.message || 'Deposit submission failed');
  }
}
