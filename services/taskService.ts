import prisma from '@/lib/prisma';
import LedgerService from './ledgerService';
import { Decimal } from '@prisma/client/runtime/library';

export class TaskService {
  /**
   * Get user daily tasks and VIP progress
   */
  static async getTasks(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyOrders: { where: { status: 'COMPLETED' } },
        sellOrders: { where: { status: 'COMPLETED' } },
        referralsGiven: true,
      },
    });

    if (!user) throw new Error('User not found');

    // Ensure default system tasks exist
    const defaultTasks = [
      {
        id: 'task_daily_checkin',
        title: 'Daily Platform Check-in',
        description: 'Log in and check in to claim your daily activity bonus',
        rewardAmount: new Decimal(0.5),
        rewardCurrency: 'ARB',
        targetCount: 1,
        taskType: 'DAILY_CHECKIN',
        vipRequirement: 0,
      },
      {
        id: 'task_buy_arb_500',
        title: 'Complete 1 Buy Order (>= ₹500)',
        description: 'Recharge or buy ARB tokens using UPI or Bank Transfer',
        rewardAmount: new Decimal(2.0),
        rewardCurrency: 'ARB',
        targetCount: 1,
        taskType: 'BUY_ARB',
        vipRequirement: 0,
      },
      {
        id: 'task_invite_friend',
        title: 'Invite 1 Active Friend',
        description: 'Invite a new friend using your unique invitation code',
        rewardAmount: new Decimal(5.0),
        rewardCurrency: 'ARB',
        targetCount: 1,
        taskType: 'INVITE_FRIEND',
        vipRequirement: 0,
      },
      {
        id: 'task_complete_kyc',
        title: 'Complete Identity KYC Verification',
        description: 'Submit your government ID to unlock higher limits and VIP rewards',
        rewardAmount: new Decimal(3.0),
        rewardCurrency: 'ARB',
        targetCount: 1,
        taskType: 'KYC_VERIFY',
        vipRequirement: 0,
      },
    ];

    for (const dt of defaultTasks) {
      await prisma.task.upsert({
        where: { id: dt.id },
        create: dt,
        update: {},
      });
    }

    const tasks = await prisma.task.findMany({
      where: { active: true },
    });

    // Fetch user progress for today
    const userTasks = await prisma.userTask.findMany({
      where: {
        userId,
        dateKey: today,
      },
    });

    // Compute progress for each task
    const taskList = tasks.map((task) => {
      let progress = 0;
      let completed = false;

      const ut = userTasks.find((u) => u.taskId === task.id);
      if (ut) {
        progress = ut.currentCount;
        completed = ut.completed;
      } else {
        // Auto-check conditions
        if (task.taskType === 'DAILY_CHECKIN') {
          progress = 1;
          completed = true;
        } else if (task.taskType === 'BUY_ARB') {
          progress = user.buyOrders.length > 0 ? 1 : 0;
          completed = progress >= task.targetCount;
        } else if (task.taskType === 'INVITE_FRIEND') {
          progress = user.referralsGiven.length > 0 ? 1 : 0;
          completed = progress >= task.targetCount;
        } else if (task.taskType === 'KYC_VERIFY') {
          progress = user.kycLevel > 0 || user.kycStatus === 'APPROVED' ? 1 : 0;
          completed = progress >= task.targetCount;
        }
      }

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        rewardAmount: task.rewardAmount.toNumber(),
        rewardCurrency: task.rewardCurrency,
        targetCount: task.targetCount,
        currentCount: progress,
        completed,
        claimed: ut?.claimed || false,
      };
    });

    return {
      vipLevel: user.vipLevel,
      tasks: taskList,
    };
  }

  /**
   * Claim daily task reward
   */
  static async claimTaskReward(userId: string, taskId: string) {
    const today = new Date().toISOString().slice(0, 10);

    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });
      if (!task) throw new Error('Task not found');

      let ut = await tx.userTask.findUnique({
        where: { userId_taskId_dateKey: { userId, taskId, dateKey: today } },
      });

      if (ut?.claimed) {
        throw new Error('Reward has already been claimed today');
      }

      if (!ut) {
        ut = await tx.userTask.create({
          data: {
            userId,
            taskId,
            dateKey: today,
            currentCount: 1,
            completed: true,
            claimed: true,
            claimedAt: new Date(),
          },
        });
      } else {
        await tx.userTask.update({
          where: { id: ut.id },
          data: {
            claimed: true,
            claimedAt: new Date(),
            completed: true,
          },
        });
      }

      // Credit reward directly to user's ARB wallet
      await LedgerService.credit(
        {
          userId,
          currency: task.rewardCurrency,
          amount: task.rewardAmount,
          type: 'TASK_REWARD',
          referenceId: taskId,
          referenceType: 'TASK',
          description: `VIP Task Reward: ${task.title}`,
          idempotencyKey: `task_${userId}_${taskId}_${today}`,
        },
        tx
      );

      await tx.notification.create({
        data: {
          userId,
          title: 'Task Reward Claimed!',
          content: `You successfully claimed ${task.rewardAmount} ${task.rewardCurrency} for completing "${task.title}".`,
          type: 'VIP',
        },
      });

      return { success: true, rewardAmount: task.rewardAmount.toNumber(), currency: task.rewardCurrency };
    });
  }
}
export default TaskService;
