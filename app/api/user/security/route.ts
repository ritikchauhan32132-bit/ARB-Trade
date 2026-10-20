import { NextRequest } from 'next/server';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import AuthService from '@/services/authService';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { action } = body;

    if (action === 'CHANGE_PASSWORD') {
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        return jsonError('Invalid password parameters');
      }

      const isValid = await verifyPassword(oldPassword, user.passwordHash);
      if (!isValid) {
        return jsonError('Current password is incorrect');
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return jsonSuccess(null, 'Password updated successfully');
    }

    if (action === 'SET_PAYMENT_PIN') {
      const { pin, loginPassword } = body;
      if (!pin || pin.length !== 6 || !loginPassword) {
        return jsonError('6-digit PIN and login password are required');
      }

      await AuthService.setPaymentPin(user.id, pin, loginPassword);
      return jsonSuccess(null, 'Payment PIN updated successfully');
    }

    if (action === 'BIND_PHONE') {
      const { phone } = body;
      if (!phone || phone.length < 8) return jsonError('Valid phone number is required');

      const existing = await prisma.user.findFirst({ where: { phone, NOT: { id: user.id } } });
      if (existing) return jsonError('Phone number is already bound to another account');

      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      });
      return jsonSuccess(null, 'Phone number updated successfully');
    }

    if (action === 'BIND_EMAIL') {
      const { email } = body;
      if (!email || !email.includes('@')) return jsonError('Valid email is required');

      const existing = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } } });
      if (existing) return jsonError('Email is already bound to another account');

      await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
      return jsonSuccess(null, 'Email updated successfully');
    }

    if (action === 'UPDATE_PROFILE') {
      const { nickname, avatar } = body;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(nickname ? { nickname } : {}),
          ...(avatar ? { avatar } : {}),
        },
      });
      return jsonSuccess(null, 'Profile updated successfully');
    }

    return jsonError('Invalid action');
  } catch (err: any) {
    return jsonError(err.message || 'Security update failed');
  }
}
