import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import OrderService from '@/services/orderService';
import AuthService from '@/services/authService';
import { SellOrderCreateSchema } from '@/validators';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = SellOrderCreateSchema.parse(body);

    const isPinValid = await AuthService.verifyPaymentPin(user.id, validated.paymentPin);
    if (!isPinValid) {
      return jsonError('Invalid Payment PIN');
    }

    const order = await OrderService.createSellOrder(
      user.id,
      validated.tokenAmount,
      validated.collectionMethodId
    );

    return jsonSuccess(order, 'Sell order created and ARB frozen in escrow');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to create sell order');
  }
}
