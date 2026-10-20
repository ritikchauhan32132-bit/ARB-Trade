import { NextRequest } from 'next/server';
import { jsonSuccess } from '@/lib/apiResponse';
import { CONSTANTS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const res = jsonSuccess(null, 'Logged out successfully');
  res.cookies.set(CONSTANTS.AUTH.SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res;
}
