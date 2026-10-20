import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import KycService from '@/services/kycService';
import { KYCSubmitSchema } from '@/validators';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const status = await KycService.getKycStatus(user.id);
    return jsonSuccess(status);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch KYC status', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = KYCSubmitSchema.parse(body);

    const record = await KycService.submitKyc(user.id, validated);
    return jsonSuccess(record, 'Identity documents submitted successfully');
  } catch (err: any) {
    return jsonError(err.message || 'KYC submission failed');
  }
}
