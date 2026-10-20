import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import OrderService from '@/services/orderService';
import AuthService from '@/services/authService';
import { ConfirmArrivalSchema } from '@/validators';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = ConfirmArrivalSchema.parse(body);

    const isPinValid = await AuthService.verifyPaymentPin(user.id, validated.paymentPin);
    if (!isPinValid) {
      return jsonError('Invalid Payment PIN');
    }

    const updated = await OrderService.confirmArrival(params.id, user.id);
    return jsonSuccess(updated, 'Payment arrival confirmed and ARB released to buyer successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Confirmation failed');
  }
}
