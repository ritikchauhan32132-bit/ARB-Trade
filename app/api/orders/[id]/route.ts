import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';
import OrderService from '@/services/orderService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: { select: { id: true, username: true } },
        seller: { select: { id: true, username: true } },
        appeals: true,
      },
    });

    if (!order) return jsonError('Order not found', 'NOT_FOUND', 404);

    // Only buyer, seller, or cashier/admin can view
    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN' && user.role !== 'CASHIER') {
      return jsonError('Unauthorized access to order', 'FORBIDDEN', 403);
    }

    return jsonSuccess(order);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch order', 'UNAUTHORIZED', 401);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const order = await OrderService.cancelOrder(params.id, user.id);
    return jsonSuccess(order, 'Order cancelled successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to cancel order');
  }
}
