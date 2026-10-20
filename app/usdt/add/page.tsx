'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function UsdtAddPage() {
  const router = useRouter();
  const [network, setNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [address, setAddress] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || address.length < 20) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    toast.success(`Saved USDT (${network}) payout address`);
    router.push('/usdt/wthdrawal');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Add USDT Payout Address" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
                Blockchain Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['TRC20', 'ERC20'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setNetwork(net)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      network === net
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    USDT-{net}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                Destination Wallet Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${network} address (e.g. ${network === 'TRC20' ? 'T...' : '0x...'})`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <span>Save USDT Address</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
