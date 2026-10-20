import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    return jsonSuccess({
      items: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}
