import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import OrderService from '@/services/orderService';
import { OrderAppealSchema } from '@/validators';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = OrderAppealSchema.parse(body);

    const appeal = await OrderService.submitAppeal(
      params.id,
      user.id,
      validated.type,
      validated.reason,
      validated.proofImageUrl
    );

    return jsonSuccess(appeal, 'Dispute appeal submitted. Admin compliance will mediate.');
  } catch (err: any) {
    return jsonError(err.message || 'Appeal submission failed');
  }
}
