'use client';

import React from 'react';
import Header from '@/components/Header';
import { CreditCard, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AddCollectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Choose Receiving Method" showBack={true} />

      <main className="p-4 space-y-3 max-w-lg mx-auto w-full">
        <Link
          href="/main/addBank"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-300 active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add Bank Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct IMPS settlement to national bank</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          href="/upi"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-300 active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add UPI ID (VPA)</h3>
              <p className="text-xs text-slate-500 mt-0.5">PhonePe, GPay, Paytm UPI settlement</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </main>
    </div>
  );
}
