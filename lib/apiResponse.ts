import { NextResponse } from 'next/server';

export function jsonSuccess<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
