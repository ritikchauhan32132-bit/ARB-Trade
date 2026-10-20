import { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { publishedAt: 'desc' },
    });
    return jsonSuccess(announcements);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch announcements');
  }
}
