'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import { Award, CheckCircle2, Gift, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [vipLevel, setVipLevel] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.data.tasks);
        setVipLevel(data.data.vipLevel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaim = async (taskId: string) => {
    setClaimingId(taskId);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to claim reward');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success(`Claimed +${data.data.rewardAmount} ${data.data.currency} Reward!`);
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 flex flex-col">
      <Header title="VIP Task & Rewards" showBack={false} rightAction="service" />

      <main className="p-4 space-y-4">
        {/* VIP Level Card */}
        <div className="rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-white p-5 shadow-xl border border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center font-extrabold text-slate-950 text-base shadow-lg shadow-yellow-500/30">
                V{vipLevel}
              </div>
              <div>
                <h2 className="font-bold text-base text-white">VIP {vipLevel} Member</h2>
                <p className="text-xs text-amber-400">Enjoy fee discounts & higher daily limits</p>
              </div>
            </div>
            <Link
              href="/task/vip"
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-semibold flex items-center"
            >
              VIP Privileges <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/60 flex justify-between text-xs text-slate-400">
            <span>Trading Fee Discount: <strong className="text-amber-400 font-bold">{vipLevel * 10}%</strong></span>
            <span>Task Bonus Multiplier: <strong className="text-amber-400 font-bold">1.{vipLevel}x</strong></span>
          </div>
        </div>

        {/* Daily Tasks Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Today's Daily Tasks</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Resets daily at 00:00 UTC</span>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading tasks...</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between space-x-3"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs font-bold text-amber-600 font-mono">
                        +{task.rewardAmount} {task.rewardCurrency}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({task.currentCount}/{task.targetCount})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.claimed ? (
                    <button
                      disabled
                      className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center space-x-1 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Claimed</span>
                    </button>
                  ) : task.completed ? (
                    <button
                      onClick={() => handleClaim(task.id)}
                      disabled={claimingId === task.id}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-md shadow-amber-400/30 active:scale-95 transition disabled:opacity-50"
                    >
                      {claimingId === task.id ? 'Claiming...' : 'Claim'}
                    </button>
                  ) : (
                    <Link
                      href={
                        task.id.includes('buy')
                          ? '/buy/arb'
                          : task.id.includes('invite')
                          ? '/main/team'
                          : '/main/kyc'
                      }
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-95 transition"
                    >
                      Go To Task
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <TabBar />
    </div>
  );
}
