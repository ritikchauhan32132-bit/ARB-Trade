import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import WalletService from '@/services/walletService';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const balances = await WalletService.getBalances(user.id);

    return jsonSuccess({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      vipLevel: user.vipLevel,
      inviteCode: user.inviteCode,
      canSell: user.canSell,
      upiBanned: user.upiBanned,
      hasPaymentPin: Boolean(user.paymentPinHash),
      balances,
    });
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch user', 'SERVER_ERROR', 500);
  }
}
