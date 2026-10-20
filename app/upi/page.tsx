'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function UpiPage() {
  const router = useRouter();
  const [realName, setRealName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName || !upiId || !paymentPin) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/collection-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'UPI',
          realName,
          upiId: upiId.toLowerCase(),
          paymentPin,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to bind UPI ID');
      }

      toast.success('UPI ID bound successfully!');
      router.push('/main/collection');
    } catch (err: any) {
      toast.error(err.message || 'Binding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Bind UPI ID" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Name registered with UPI app"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                UPI ID (VPA) *
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis, yourname@paytm"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                6-Digit Payment PIN *
              </label>
              <input
                type="password"
                maxLength={6}
                value={paymentPin}
                onChange={(e) => setPaymentPin(e.target.value)}
                placeholder="Enter 6-digit PIN to authorize"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition disabled:opacity-50 mt-3"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Binding UPI...' : 'Confirm UPI ID'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
