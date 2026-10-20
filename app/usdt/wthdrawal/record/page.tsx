'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatUSDT } from '@/lib/utils';
import { History, ArrowUpRight } from 'lucide-react';

export default function UsdtWithdrawalRecordPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/usdt/withdrawal')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecords(d.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Withdrawal History" showBack={true} />

      <main className="p-4 space-y-3 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading withdrawals...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">No Withdrawal Records</p>
          </div>
        ) : (
          records.map((w) => (
            <div
              key={w.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">USDT ({w.network})</span>
                    <Badge status={w.status} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]">
                    To: {w.destinationAddress}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(w.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-bold text-sm text-rose-600">
                  -{formatUSDT(w.amount)}
                </p>
                <p className="text-[10px] text-slate-400">Fee: {w.fee} USDT</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
