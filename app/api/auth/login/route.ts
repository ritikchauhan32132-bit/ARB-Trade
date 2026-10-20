import { NextRequest } from 'next/server';
import { LoginSchema } from '@/validators';
import AuthService from '@/services/authService';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import { CONSTANTS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const ip = req.headers.get('x-forwarded-for') || req.ip;
    const userAgent = req.headers.get('user-agent');

    const { user, token } = await AuthService.login(
      validated.identifier,
      validated.password,
      ip || undefined,
      userAgent || undefined
    );

    const res = jsonSuccess(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycLevel: user.kycLevel,
        kycStatus: user.kycStatus,
        vipLevel: user.vipLevel,
        inviteCode: user.inviteCode,
        hasPaymentPin: Boolean(user.paymentPinHash),
      },
      'Login successful'
    );

    res.cookies.set(CONSTANTS.AUTH.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CONSTANTS.AUTH.SESSION_MAX_AGE,
      path: '/',
    });

    return res;
  } catch (err: any) {
    return jsonError(err.message || 'Login failed', 'INVALID_CREDENTIALS', 401);
  }
}
