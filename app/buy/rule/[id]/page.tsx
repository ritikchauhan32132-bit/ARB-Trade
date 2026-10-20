'use client';

import React from 'react';
import Header from '@/components/Header';
import { useParams } from 'next/navigation';

export default function BuyRuleDetailPage() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header title={`Purchase Rule #${params.id}`} showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto text-xs leading-relaxed text-slate-600">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900">Specific Recharge Rule Information</h2>
          <p>
            Recharge rule tier #{params.id}: Buy ARB tokens directly from matched cashier desks with 0% gateway commission. Settlements occur atomically via server double-entry ledger.
          </p>
        </div>
      </main>
    </div>
  );
}
