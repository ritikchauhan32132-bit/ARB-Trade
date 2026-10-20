import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import WalletService from '@/services/walletService';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const currency = searchParams.get('currency') || undefined;
    const type = searchParams.get('type') || undefined;

    const data = await WalletService.getTransactions(user.id, page, limit, currency, type);
    return jsonSuccess(data);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch transaction stream', 'UNAUTHORIZED', 401);
  }
}
