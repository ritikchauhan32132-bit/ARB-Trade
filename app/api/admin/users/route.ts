import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;

    const data = await AdminService.getUsers(page, limit, search, status, role);
    return jsonSuccess(data);
  } catch (err: any) {
    return jsonError(err.message || 'Access denied', 'FORBIDDEN', 403);
  }
}
