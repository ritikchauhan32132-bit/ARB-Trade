import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: any = {
      OR: [{ buyerId: user.id }, { sellerId: user.id }],
    };

    if (type && type !== 'ALL') where.type = type;
    if (status && status !== 'ALL') where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { username: true } },
        seller: { select: { username: true } },
      },
    });

    return jsonSuccess(orders);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch orders', 'UNAUTHORIZED', 401);
  }
}
