'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatINR, formatARB, formatUSDT } from '@/lib/utils';
import { CONSTANTS } from '@/lib/constants';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  FileText,
  Filter,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  const [balances, setBalances] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWalletData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        fetch('/api/wallet/balances'),
        fetch(`/api/wallet/transactions${selectedCurrency !== 'ALL' ? `?currency=${selectedCurrency}` : ''}`),
      ]);
      const balData = await balRes.json();
      const txData = await txRes.json();

      if (balData.success) setBalances(balData.data);
      if (txData.success) setTransactions(txData.data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [selectedCurrency]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Multi-Asset Wallet" showBack={true} rightAction="service" />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Total Assets Overview */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-400">Total Asset Valuation</span>
          <h2 className="text-3xl font-black font-mono mt-1 text-white">
            {formatINR(balances?.totalValuationINR || 0)}
          </h2>
          <p className="text-xs text-amber-400 font-mono mt-0.5">
            ≈ {formatUSDT(balances?.totalValuationUSDT || 0)}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60">
            <Link
              href="/buy/arb"
              className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md shadow-amber-400/20 active:scale-95 transition"
            >
              <ArrowDownLeft className="w-4 h-4 font-bold" />
              <span>Buy ARB</span>
            </Link>
            <Link
              href="/sell"
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 active:scale-95 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Sell ARB</span>
            </Link>
          </div>
        </div>

        {/* Individual Asset Breakdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide px-1">
            Asset Breakdown
          </h3>

          {/* ARB Token */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
                ARB
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">ARB Token</h4>
                <p className="text-[11px] text-slate-500">Frozen: {formatARB(balances?.arb?.frozen || 0)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-slate-900 font-mono">
                {formatARB(balances?.arb?.available || 0)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                ≈ {formatINR((balances?.arb?.available || 0) * CONSTANTS.RATES.ARB_TO_INR)}
              </p>
            </div>
          </div>

          {/* USDT */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-xs">
                USDT
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Tether USD (TRC/ERC)</h4>
                <p className="text-[11px] text-slate-500">Frozen: {formatUSDT(balances?.usdt?.frozen || 0)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-slate-900 font-mono">
                {formatUSDT(balances?.usdt?.available || 0)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                ≈ {formatINR((balances?.usdt?.available || 0) * CONSTANTS.RATES.USDT_TO_INR)}
              </p>
            </div>
          </div>

          {/* INR Fiat */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                INR
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Fiat INR</h4>
                <p className="text-[11px] text-slate-500">Bank & UPI Settlement</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-slate-900 font-mono">
                {formatINR(balances?.inr?.available || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History Filter & Stream */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Ledger Statements
            </h3>
            <div className="flex space-x-1">
              {['ALL', 'ARB', 'USDT'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    selectedCurrency === curr
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading ledger...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No transaction records found</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs mt-0.5 ${
                        tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{tx.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono font-bold text-xs ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} {tx.currency}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Bal: {tx.balanceAfter} {tx.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
