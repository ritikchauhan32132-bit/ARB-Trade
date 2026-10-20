'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { formatUSDT, formatINR } from '@/lib/utils';
import { CONSTANTS } from '@/lib/constants';
import { Zap, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function UsdtDetailPage() {
  const [balances, setBalances] = useState<any>(null);

  useEffect(() => {
    fetch('/api/wallet/balances')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBalances(d.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="USDT Asset Details" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              USDT
            </div>
            <div>
              <h2 className="font-bold text-sm">Tether USD</h2>
              <p className="text-xs text-slate-400">TRC20 / ERC20 Settlement</p>
            </div>
          </div>

          <h3 className="text-3xl font-black font-mono text-emerald-400 mt-3">
            {formatUSDT(balances?.usdt?.available || 0)}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            ≈ {formatINR((balances?.usdt?.available || 0) * CONSTANTS.RATES.USDT_TO_INR)}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700">
            <Link
              href="/usdt/recharge"
              className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <ArrowDownLeft className="w-4 h-4 font-bold" />
              <span>Deposit USDT</span>
            </Link>
            <Link
              href="/usdt/wthdrawal"
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw USDT</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
