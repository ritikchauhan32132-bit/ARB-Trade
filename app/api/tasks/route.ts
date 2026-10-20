import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import TaskService from '@/services/taskService';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await TaskService.getTasks(user.id);
    return jsonSuccess(data);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch tasks', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) return jsonError('Task ID is required');

    const result = await TaskService.claimTaskReward(user.id, taskId);
    return jsonSuccess(result, 'Reward claimed successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Failed to claim reward');
  }
}
