'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { CreditCard, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CollectionPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/user/collection-methods');
      const data = await res.json();
      if (data.success) setMethods(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this collection method?')) return;
    try {
      const res = await fetch(`/api/user/collection-methods?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Collection method removed');
        fetchMethods();
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header
        title="Receiving Accounts"
        showBack={true}
        rightAction={
          <Link href="/main/addCollection" className="p-1 text-amber-600 hover:text-amber-700">
            <Plus className="w-6 h-6" />
          </Link>
        }
      />

      <main className="p-4 space-y-3 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading collection accounts...</div>
        ) : methods.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">No Collection Accounts Bound</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Bind your Bank Account or UPI ID to receive fiat when selling ARB tokens.
            </p>
            <Link
              href="/main/addCollection"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </Link>
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs mt-0.5">
                  {m.type === 'UPI' ? 'UPI' : 'BANK'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">
                      {m.type === 'UPI' ? `UPI VPA` : m.bankName}
                    </span>
                    {m.isDefault && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {m.type === 'UPI' ? m.upiId : `${m.accountNumber} (${m.ifscCode})`}
                  </p>
                  <p className="text-[11px] text-slate-500">Holder: {m.realName}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(m.id)}
                className="p-2 text-slate-400 hover:text-rose-600 active:scale-95 transition"
                title="Remove account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
