'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';
import {
  ShieldCheck,
  CreditCard,
  Users,
  Lock,
  Headphones,
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
  Globe,
  Bell,
  FileCheck2,
  Copy,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MainPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      });
  }, []);

  const handleCopyInvite = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      toast.success('Invitation code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Signed out successfully');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 flex flex-col">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-8 pb-6 px-5 rounded-b-[32px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-md">
              {user?.username?.slice(0, 2).toUpperCase() || 'AR'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base text-white">{user?.nickname || user?.username}</h1>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold rounded-full">
                  VIP {user?.vipLevel || 0}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">UID: {user?.id?.slice(-8)}</p>
            </div>
          </div>

          <Link
            href="/main/seting"
            className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </Link>
        </div>

        {/* Invite Code Box */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">My Invitation Code</span>
            <p className="font-mono font-bold text-sm text-amber-400">{user?.inviteCode || '••••••'}</p>
          </div>
          <button
            onClick={handleCopyInvite}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Profile Links & Navigation Menu */}
      <main className="p-4 space-y-3 -mt-2">
        {/* Verification Status Card */}
        <Link
          href="/main/kyc"
          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Identity Verification (KYC)</p>
              <p className="text-[11px] text-slate-500">
                {user?.kycLevel > 0
                  ? `Level ${user.kycLevel} Verified (Approved)`
                  : 'Unverified — Unlock Higher Limits'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.kycStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : user?.kycStatus === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {user?.kycStatus || 'UNSUBMITTED'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </Link>

        {/* Group 1: Financial & Security */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <Link
            href="/wallet"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">Multi-Asset Wallet Overview</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/main/collection"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">Receiving Bank & UPI Accounts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/main/securityCenter"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">
                Security Center & Payment PIN
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Group 2: Team & Rewards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <Link
            href="/main/team"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-900">Team & Referral Rebates</p>
                <p className="text-[10px] text-slate-400">Earn up to 5% multi-tier commissions</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/task/vip"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">VIP Privileges & Tiers</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Group 3: Support & System */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <Link
            href="/helpCenter"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">Help Center & Tickets</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/main/notice"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">System Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/main/lang"
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-slate-900">Language Settings</span>
            </div>
            <span className="text-xs text-slate-400 mr-1">English</span>
          </Link>

          {/* Admin link if user is admin */}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 transition text-amber-900"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  ADM
                </div>
                <span className="font-bold text-xs">Admin Management Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700" />
            </Link>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of AR Wallet</span>
        </button>
      </main>

      <TabBar />
    </div>
  );
}
