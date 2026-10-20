'use client';

import React from 'react';
import Header from '@/components/Header';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UsdtRechargeSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between pb-8">
      <Header title="Deposit Submitted" showBack={false} />

      <div className="p-8 text-center flex flex-col items-center my-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Deposit Proof Submitted!</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          Your transaction hash has been broadcast to verification nodes. Once blockchain confirmations complete, USDT will credit to your wallet.
        </p>
      </div>

      <div className="p-4 space-y-2 max-w-lg mx-auto w-full">
        <Link
          href="/usdt/recharge/record"
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition"
        >
          <span>View Deposit Records</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/wallet"
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center transition"
        >
          Wallet Overview
        </Link>
      </div>
    </div>
  );
}
