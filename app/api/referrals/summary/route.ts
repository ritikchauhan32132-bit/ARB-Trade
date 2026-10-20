import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import ReferralService from '@/services/referralService';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const summary = await ReferralService.getTeamSummary(user.id);
    return jsonSuccess(summary);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch referral summary', 'UNAUTHORIZED', 401);
  }
}
