import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return jsonSuccess(notifications);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch notifications', 'UNAUTHORIZED', 401);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return jsonSuccess(null, 'All notifications marked as read');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to update notifications');
  }
}
