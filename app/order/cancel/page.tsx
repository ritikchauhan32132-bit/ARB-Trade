'use client';

import React from 'react';
import Header from '@/components/Header';
import { XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between pb-8">
      <Header title="Order Cancelled" showBack={true} />

      <div className="p-8 text-center flex flex-col items-center my-auto">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Order Was Cancelled</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          The transaction has been cancelled. Any escrowed assets have been unlocked and returned to your available balance.
        </p>
      </div>

      <div className="p-4 space-y-2">
        <Link
          href="/home"
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
