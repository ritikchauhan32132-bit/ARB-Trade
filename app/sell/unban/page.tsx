'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SellUnbanPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.length < 10) {
      toast.error('Please describe your appeal in detail (at least 10 characters)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Selling privilege review request submitted to compliance');
      router.push('/main');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Request Selling Privilege Unban" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>Appeal Account Selling Privileges</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            If your account selling capability has been temporarily restricted due to order disputes or unverified collection details, please submit an appeal below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Detailed Explanation & Reason
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why your selling rights should be restored..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition disabled:opacity-50"
            >
              <span>{loading ? 'Submitting...' : 'Submit Unban Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
