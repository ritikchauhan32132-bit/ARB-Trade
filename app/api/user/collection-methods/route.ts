import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';
import AuthService from '@/services/authService';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const methods = await prisma.collectionMethod.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });
    return jsonSuccess(methods);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch collection methods', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { type, realName, bankName, accountNumber, ifscCode, branch, upiId, paymentPin } = body;

    if (!paymentPin) return jsonError('Payment PIN is required');
    const isPinValid = await AuthService.verifyPaymentPin(user.id, paymentPin);
    if (!isPinValid) return jsonError('Invalid Payment PIN');

    if (type === 'BANK_ACCOUNT') {
      if (!realName || !bankName || !accountNumber || !ifscCode) {
        return jsonError('Missing required bank details');
      }

      const method = await prisma.collectionMethod.create({
        data: {
          userId: user.id,
          type: 'BANK_ACCOUNT',
          realName,
          bankName,
          accountNumber,
          ifscCode,
          branch: branch || null,
        },
      });
      return jsonSuccess(method, 'Bank account added successfully');
    }

    if (type === 'UPI') {
      if (!realName || !upiId) {
        return jsonError('Missing required UPI details');
      }

      const method = await prisma.collectionMethod.create({
        data: {
          userId: user.id,
          type: 'UPI',
          realName,
          upiId,
        },
      });
      return jsonSuccess(method, 'UPI ID added successfully');
    }

    return jsonError('Invalid collection type');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to add collection method');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return jsonError('Method ID is required');

    await prisma.collectionMethod.deleteMany({
      where: { id, userId: user.id },
    });

    return jsonSuccess(null, 'Collection method removed');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to delete collection method');
  }
}
