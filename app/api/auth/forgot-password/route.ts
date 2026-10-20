import { NextRequest } from 'next/server';
import { ForgotPasswordSchema } from '@/validators';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ForgotPasswordSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validated.identifier },
          { email: validated.identifier },
          { phone: validated.identifier },
        ],
      },
    });

    if (!user) {
      return jsonError('User not found');
    }

    const passwordHash = await hashPassword(validated.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return jsonSuccess(null, 'Password has been reset successfully. Please log in.');
  } catch (err: any) {
    return jsonError(err.message || 'Password reset failed');
  }
}
