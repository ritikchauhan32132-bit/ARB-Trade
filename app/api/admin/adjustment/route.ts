import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AdminService from '@/services/adminService';
import { AdminManualAdjustmentSchema } from '@/validators';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await req.json();
    const validated = AdminManualAdjustmentSchema.parse(body);

    const result = await AdminService.manualAdjustment(
      admin.id,
      validated.userId,
      validated.currency,
      validated.amount,
      validated.reason
    );

    return jsonSuccess(result, 'Manual balance adjustment completed with immutable ledger entry');
  } catch (err: any) {
    return jsonError(err.message || 'Balance adjustment failed');
  }
}
