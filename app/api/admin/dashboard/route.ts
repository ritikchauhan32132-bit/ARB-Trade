import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const metrics = await AdminService.getDashboardMetrics();
    return jsonSuccess(metrics);
  } catch (err: any) {
    return jsonError(err.message || 'Admin dashboard access denied', 'FORBIDDEN', 403);
  }
}
