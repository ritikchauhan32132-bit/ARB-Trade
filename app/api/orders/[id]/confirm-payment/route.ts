import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import OrderService from '@/services/orderService';
import { ConfirmPaymentSchema } from '@/validators';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = ConfirmPaymentSchema.parse(body);

    const updated = await OrderService.confirmPayment(
      params.id,
      user.id,
      validated.utrNumber,
      validated.proofImageUrl
    );

    return jsonSuccess(updated, 'Payment proof submitted. Awaiting cashier/seller confirmation.');
  } catch (err: any) {
    return jsonError(err.message || 'Payment confirmation failed');
  }
}
