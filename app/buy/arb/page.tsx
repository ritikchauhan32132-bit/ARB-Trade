'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { CONSTANTS } from '@/lib/constants';
import { formatINR, formatARB } from '@/lib/utils';
import { ArrowDownLeft, Shield, ChevronRight, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function BuyArbPage() {
  const router = useRouter();
  const [amountINR, setAmountINR] = useState<string>('1000');
  const [selectedMethod, setSelectedMethod] = useState<string>('PHONEPE');
  const [loading, setLoading] = useState<boolean>(false);

  const numAmount = parseFloat(amountINR) || 0;
  const calculatedARB = numAmount / CONSTANTS.RATES.ARB_TO_INR;

  const paymentMethods = [
    { id: 'PHONEPE', name: 'PhonePe UPI', desc: 'Instant UPI App Transfer', badge: 'Fastest' },
    { id: 'PAYTM', name: 'Paytm UPI', desc: 'Paytm UPI / Wallet', badge: 'Popular' },
    { id: 'GPAY', name: 'Google Pay', desc: 'Google Pay UPI Transfer', badge: 'Instant' },
    { id: 'BANK', name: 'IMPS Bank Transfer', desc: 'National Bank Settlement', badge: 'High Limit' },
  ];

  const handleCreateOrder = async () => {
    if (numAmount < CONSTANTS.TRADING_LIMITS.MIN_BUY_INR || numAmount > CONSTANTS.TRADING_LIMITS.MAX_BUY_INR) {
      toast.error(`Buy amount must be between ₹${CONSTANTS.TRADING_LIMITS.MIN_BUY_INR} and ₹${CONSTANTS.TRADING_LIMITS.MAX_BUY_INR}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders/buy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiatAmount: numAmount,
          paymentMethod: selectedMethod,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate buy order');
      }

      toast.success('Matched with cashier desk!');
      router.push(`/order/detail?id=${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Buy ARB (Fast Recharge)" showBack={true} rightAction="service" />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Rate Info Card */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl p-5 text-slate-950 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900/80">Live Exchange Rate</span>
            <span className="text-xs font-extrabold bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">0% Fee</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono">1 ARB = ₹100.00</span>
          </div>
          <p className="text-[11px] font-medium text-slate-900/80 mt-1">
            Instant liquidity match via dedicated cashiers with verified UPI & IMPS.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
              Purchase Amount (INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-lg text-slate-700">₹</span>
              <input
                type="number"
                value={amountINR}
                onChange={(e) => setAmountINR(e.target.value)}
                placeholder="Enter amount in INR"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-9 pr-4 py-3 text-lg font-bold font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2">
            {['500', '1000', '5000', '10000'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountINR(amt)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  amountINR === amt
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* ARB Tokens to Receive */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[11px] text-slate-400">You Receive:</span>
              <p className="text-xl font-extrabold text-amber-400 font-mono">
                {formatARB(calculatedARB)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedMethod === m.id
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedMethod === m.id}
                      onChange={() => setSelectedMethod(m.id)}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-500">{m.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {m.badge}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/25 active:scale-[0.98] transition disabled:opacity-50"
          >
            <ArrowDownLeft className="w-5 h-5 font-bold" />
            <span>{loading ? 'Matching Cashier Desk...' : 'Proceed to Pay'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
