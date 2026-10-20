'use client';

import React from 'react';
import Header from '@/components/Header';
import { ShieldAlert, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function DisablePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col justify-between">
      <Header title="Account Restrictions" showBack={true} />

      <main className="p-6 max-w-lg mx-auto w-full text-center my-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">Feature Currently Restricted</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          This function is restricted for your account tier. Please contact our 24/7 compliance support team to verify your identity documents or resolve outstanding disputes.
        </p>
      </main>

      <div className="p-4 max-w-lg mx-auto w-full">
        <Link
          href="/helpCenter"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition"
        >
          <Headphones className="w-4 h-4" />
          <span>Contact Compliance Support</span>
        </Link>
      </div>
    </div>
  );
}
