'use client';

import React from 'react';
import Header from '@/components/Header';

export default function ActivaRulesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header title="Account Activation Rules" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto text-xs leading-relaxed text-slate-600">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900">Account Activation Policy</h2>
          <p>
            New user accounts are initialized with standard Tier 0 trading access. To activate full selling privileges and high withdrawal limits, users must complete Level 1 identity verification (Aadhaar/PAN Card) and bind at least one verified bank account or UPI ID.
          </p>
        </div>
      </main>
    </div>
  );
}
