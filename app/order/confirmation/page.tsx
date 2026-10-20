'use client';

import React from 'react';
import Header from '@/components/Header';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between pb-8">
      <Header title="Order Completed" showBack={false} />

      <div className="p-8 text-center flex flex-col items-center my-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Trade Successful!</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          Your settlement has been finalized and recorded immutably on the server ledger.
        </p>
      </div>

      <div className="p-4 space-y-2">
        <Link
          href="/wallet"
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md shadow-amber-400/25 transition"
        >
          <span>View Wallet Balance</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/home"
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
