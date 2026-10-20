'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Headphones,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import TabBar from '@/components/TabBar';
import { formatINR, formatARB, formatUSDT } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [balances, setBalances] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [userRes, annRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/announcements'),
      ]);

      const userData = await userRes.json();
      const annData = await annRes.json();

      if (userData.success) {
        setUser(userData.data);
        setBalances(userData.data.balances);
      }
      if (annData.success) {
        setAnnouncements(annData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
            {user?.username?.slice(0, 2).toUpperCase() || 'AR'}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-slate-800 truncate max-w-[120px]">
                {user?.nickname || user?.username || 'Trader'}
              </span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-300">
                VIP {user?.vipLevel || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/helpCenter"
            className="p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition active:scale-95"
            title="Customer Service"
          >
            <Headphones className="w-4 h-4" />
          </Link>
          <Link
            href="/main/notice"
            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition relative active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 shadow-xl border border-slate-700/50">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-400">Total Asset Valuation</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white transition"
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
                toast.success('Balances refreshed');
              }}
              className="text-slate-400 hover:text-amber-400 transition"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Large Valuation */}
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {showBalance ? formatINR(balances?.totalValuationINR || 0) : '••••••••'}
            </h2>
            <p className="text-xs text-amber-400/90 font-mono mt-0.5">
              ≈ {showBalance ? formatUSDT(balances?.totalValuationUSDT || 0) : '••••••'}
            </p>
          </div>

          {/* Sub Balances */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">ARB Balance</p>
              <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                {showBalance ? formatARB(balances?.arb?.available || 0) : '••••'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">USDT Balance</p>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                {showBalance ? formatUSDT(balances?.usdt?.available || 0) : '••••'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">INR Wallet</p>
              <p className="text-xs font-bold text-white font-mono mt-0.5">
                {showBalance ? formatINR(balances?.inr?.available || 0) : '••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          <Link
            href="/buy/arb"
            className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold mb-1.5 shadow-sm shadow-amber-400/30">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Buy ARB</span>
            <span className="text-[9px] text-slate-400">UPI / Bank</span>
          </Link>

          <Link
            href="/sell/sellOut"
            className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-amber-400 font-bold mb-1.5 shadow-sm">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Sell ARB</span>
            <span className="text-[9px] text-slate-400">Instant Cash</span>
          </Link>

          <Link
            href="/usdt/recharge"
            className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold mb-1.5 shadow-sm shadow-emerald-400/30">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">USDT In</span>
            <span className="text-[9px] text-slate-400">TRC20 / ERC</span>
          </Link>

          <Link
            href="/usdt/wthdrawal"
            className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold mb-1.5 shadow-sm shadow-rose-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Withdraw</span>
            <span className="text-[9px] text-slate-400">On-Chain</span>
          </Link>
        </div>

        {/* Live Market Ticker */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-extrabold text-sm">
              ARB
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-slate-900">ARB / INR</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  Official Rate
                </span>
              </div>
              <p className="text-xs text-slate-500">24h Vol: 1,280,450 ARB</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-slate-900 font-mono">₹100.00</p>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.00% (Pegged)
            </span>
          </div>
        </div>

        {/* Announcement Marquee */}
        {announcements.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate mr-2">
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium truncate">
                {announcements[0].title} — {announcements[0].content}
              </p>
            </div>
            <Link
              href="/main/announcement"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 shrink-0 flex items-center"
            >
              More <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Task & VIP Promotion Banner */}
        <Link
          href="/task"
          className="block bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 rounded-2xl p-4 text-slate-950 shadow-md shadow-yellow-500/20 active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-slate-900" />
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  Daily VIP Tasks Center
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800">
                Complete daily check-ins & trades to claim up to 10.5 ARB daily rewards.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </main>

      <TabBar />
    </div>
  );
}
