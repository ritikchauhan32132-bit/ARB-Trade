'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { AlertCircle, CreditCard, ArrowRight } from 'lucide-react';

export default function SellUpiBanPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col justify-between">
      <Header title="UPI Collection Restricted" showBack={true} />

      <main className="p-5 max-w-lg mx-auto w-full my-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">UPI Collection Channel Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Your account is currently restricted from using UPI collection VPAs. You can continue trading and receiving funds via direct IMPS Bank Account binding.
        </p>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <span className="font-bold text-slate-800">Recommended Resolution:</span>
          <p className="text-slate-600">
            1. Bind an active Bank Account (Real Name, Account Number, IFSC).
          </p>
          <p className="text-slate-600">
            2. Sell ARB orders will be routed seamlessly via IMPS Bank Transfer.
          </p>
        </div>
      </main>

      <div className="p-4 max-w-lg mx-auto w-full">
        <Link
          href="/main/addBank"
          className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Bind Bank Account</span>
        </Link>
      </div>
    </div>
  );
}
