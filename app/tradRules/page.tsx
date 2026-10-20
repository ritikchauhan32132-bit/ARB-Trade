'use client';

import React from 'react';
import Header from '@/components/Header';

export default function TradRulesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header title="Trading Rules & Guidelines" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto text-xs leading-relaxed text-slate-600">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900">1. Buy Order Flow & Timing</h2>
          <p>
            When initiating a Buy ARB order, the buyer has exactly 15 minutes to transfer the designated fiat amount to the matched cashier's UPI or Bank account.
          </p>
          <p>
            The buyer MUST enter their actual 12-digit UTR number from their bank/UPI application.
          </p>

          <h2 className="font-bold text-sm text-slate-900 pt-2">2. Sell Order Escrow Protection</h2>
          <p>
            When selling ARB, tokens are automatically deducted from available balance and held in smart escrow. Once fiat is received in your bank, enter your 6-digit Payment PIN to release tokens.
          </p>

          <h2 className="font-bold text-sm text-slate-900 pt-2">3. Dispute Appeals</h2>
          <p>
            If payment is not received within the countdown or if the amount is incorrect, sellers can submit a formal appeal along with their bank statement screenshot.
          </p>
        </div>
      </main>
    </div>
  );
}
