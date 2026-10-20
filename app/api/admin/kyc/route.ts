import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const records = await prisma.kycRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true, phone: true } } },
    });
    return jsonSuccess(records);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await req.json();
    const { kycId, action, rejectionReason } = body;

    if (!kycId || !action) return jsonError('KYC ID and action are required');

    const result = await AdminService.reviewKyc(kycId, admin.id, action, rejectionReason);
    return jsonSuccess(result, `KYC record ${action.toLowerCase()}ed successfully`);
  } catch (err: any) {
    return jsonError(err.message || 'KYC review failed');
  }
}
