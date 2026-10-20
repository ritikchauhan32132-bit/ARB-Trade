import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const appeals = await prisma.orderAppeal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            buyer: { select: { username: true } },
            seller: { select: { username: true } },
          },
        },
        user: { select: { username: true, role: true } },
      },
    });
    return jsonSuccess(appeals);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await req.json();
    const { appealId, resolution, adminNote } = body;

    if (!appealId || !resolution || !adminNote) {
      return jsonError('Appeal ID, resolution and note are required');
    }

    const result = await AdminService.resolveAppeal(appealId, admin.id, resolution, adminNote);
    return jsonSuccess(result, 'Dispute resolved successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Dispute resolution failed');
  }
}
