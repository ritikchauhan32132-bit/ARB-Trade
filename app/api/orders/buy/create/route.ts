import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import OrderService from '@/services/orderService';
import { BuyOrderCreateSchema } from '@/validators';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = BuyOrderCreateSchema.parse(body);

    const order = await OrderService.createBuyOrder(user.id, validated.fiatAmount, validated.paymentMethod);
    return jsonSuccess(order, 'Buy order created successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to create buy order');
  }
}
