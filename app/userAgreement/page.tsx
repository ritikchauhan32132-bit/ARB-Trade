'use client';

import React from 'react';
import Header from '@/components/Header';

export default function UserAgreementPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header title="User Agreement & Privacy Policy" showBack={true} />

      <div className="p-5 max-w-lg mx-auto text-xs leading-relaxed space-y-4 text-slate-600">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-800">1. Acceptance of Terms</h2>
          <p>
            By creating an account or accessing the AR Wallet platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="font-bold text-sm text-slate-800 pt-2">2. Digital Asset Settlement & C2C Trading</h2>
          <p>
            AR Wallet provides peer-to-peer settlement infrastructure. Users are responsible for verifying payment arrival in their external bank account or UPI application before releasing digital tokens from escrow.
          </p>
          <p>
            Once a seller confirms payment receipt and enters their 6-digit Payment PIN, the smart ledger transaction is final, immutable, and cannot be reversed.
          </p>

          <h2 className="font-bold text-sm text-slate-800 pt-2">3. Identity Verification (KYC)</h2>
          <p>
            To maintain compliance and protect liquidity, users may be required to complete Level 1 and Level 2 identity verification prior to exceeding daily transaction thresholds.
          </p>

          <h2 className="font-bold text-sm text-slate-800 pt-2">4. Prohibited Activities</h2>
          <p>
            Any fraudulent chargebacks, false UTR submissions, money laundering, or malicious disputes will result in immediate permanent freezing of accounts, confiscation of escrowed collateral, and legal reporting.
          </p>

          <h2 className="font-bold text-sm text-slate-800 pt-2">5. Privacy & Data Protection</h2>
          <p>
            User personal information and submitted identity documents are stored in encrypted private buckets and strictly accessible only to authorized compliance reviewers.
          </p>
        </div>
      </div>
    </div>
  );
}
