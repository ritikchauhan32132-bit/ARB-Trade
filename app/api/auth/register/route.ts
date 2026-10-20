import { NextRequest } from 'next/server';
import { RegisterSchema } from '@/validators';
import AuthService from '@/services/authService';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import { CONSTANTS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const user = await AuthService.register({
      username: validated.username,
      email: validated.email,
      phone: validated.phone,
      password: validated.password,
      inviteCode: validated.inviteCode,
    });

    const { token } = await AuthService.login(user.username, validated.password);

    const res = jsonSuccess(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        inviteCode: user.inviteCode,
      },
      'Registration successful'
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
    return jsonError(err.message || 'Registration failed');
  }
}
