import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true, phone: true } } },
    });
    return jsonSuccess(withdrawals);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await req.json();
    const { withdrawalId, action, rejectionReason } = body;

    if (!withdrawalId || !action) return jsonError('Withdrawal ID and action are required');

    const result = await AdminService.reviewWithdrawal(withdrawalId, admin.id, action, rejectionReason);
    return jsonSuccess(result, `Withdrawal ${action.toLowerCase()}ed successfully`);
  } catch (err: any) {
    return jsonError(err.message || 'Withdrawal review failed');
  }
}
