import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import WalletService from '@/services/walletService';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const balances = await WalletService.getBalances(user.id);
    return jsonSuccess(balances);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch balances', 'UNAUTHORIZED', 401);
  }
}
