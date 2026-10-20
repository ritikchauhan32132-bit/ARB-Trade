'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Upload, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OrderAppealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';

  const [appealType, setAppealType] = useState<string>('PAYMENT_NOT_RECEIVED');
  const [reason, setReason] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('/uploads/sample_statement.png');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast.error('Missing order reference ID');
      return;
    }
    if (!reason || reason.length < 10) {
      toast.error('Please provide a detailed dispute explanation (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: appealType,
          reason,
          proofImageUrl: proofUrl,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit dispute appeal');
      }

      toast.success('Dispute appeal filed! Compliance mediator assigned.');
      router.push(`/order/detail?id=${orderId}`);
    } catch (err: any) {
      toast.error(err.message || 'Appeal submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Submit Dispute Appeal" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5" />
            <span>Official Order Dispute Resolution</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                Dispute Reason Category *
              </label>
              <select
                value={appealType}
                onChange={(e) => setAppealType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="PAYMENT_NOT_RECEIVED">Payment Not Received in Bank / UPI</option>
                <option value="WRONG_AMOUNT">Incorrect Fiat Amount Transferred</option>
                <option value="FRAUD_CLAIM">Counterparty Identity / UTR Fraud</option>
                <option value="KYC_APPEAL">Account Name Mismatch with Bank Account</option>
                <option value="OTHER">Other Dispute Reason</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                Detailed Statement & Description *
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the discrepancy and provide all transaction details..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                Attach Bank Statement / Proof Screenshot
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">Bank Statement Attached</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, PDF up to 10MB</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-rose-500/30 active:scale-[0.98] transition disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? 'Filing Appeal...' : 'Submit Dispute to Compliance'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
