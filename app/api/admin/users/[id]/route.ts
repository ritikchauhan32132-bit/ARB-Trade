import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        wallets: true,
        collectionMethods: true,
        kycRecords: true,
        ledgerEntries: { take: 20, orderBy: { createdAt: 'desc' } },
        buyOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        sellOrders: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) return jsonError('User not found', 'NOT_FOUND', 404);
    return jsonSuccess(user);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await req.json();

    const updated = await AdminService.updateUserStatus(params.id, admin.id, body);
    return jsonSuccess(updated, 'User status updated successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to update user');
  }
}
