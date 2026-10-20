import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN', 'CASHIER']);
    const deposits = await prisma.deposit.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true, phone: true } } },
    });
    return jsonSuccess(deposits);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN', 'CASHIER']);
    const body = await req.json();
    const { depositId, action, rejectionReason } = body;

    if (!depositId || !action) return jsonError('Deposit ID and action are required');

    const result = await AdminService.reviewDeposit(depositId, admin.id, action, rejectionReason);
    return jsonSuccess(result, `Deposit ${action.toLowerCase()}ed successfully`);
  } catch (err: any) {
    return jsonError(err.message || 'Deposit review failed');
  }
}
