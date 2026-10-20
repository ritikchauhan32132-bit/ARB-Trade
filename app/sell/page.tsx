'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import PinModal from '@/components/PinModal';
import { formatINR, formatARB } from '@/lib/utils';
import { CONSTANTS } from '@/lib/constants';
import { ArrowUpRight, Shield, CreditCard, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellPage() {
  const router = useRouter();
  const [tokenAmount, setTokenAmount] = useState<string>('50');
  const [balances, setBalances] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balRes, colRes] = await Promise.all([
          fetch('/api/wallet/balances'),
          fetch('/api/user/collection-methods'),
        ]);
        const balData = await balRes.json();
        const colData = await colRes.json();

        if (balData.success) setBalances(balData.data);
        if (colData.success && colData.data.length > 0) {
          setCollections(colData.data);
          setSelectedCollectionId(colData.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const numAmount = parseFloat(tokenAmount) || 0;
  const expectedINR = numAmount * CONSTANTS.RATES.ARB_TO_INR;

  const handleStartSell = () => {
    if (!tokenAmount || numAmount <= 0) {
      toast.error('Please enter a valid ARB sell amount');
      return;
    }
    if (numAmount < CONSTANTS.TRADING_LIMITS.MIN_SELL_ARB) {
      toast.error(`Minimum sell amount is ${CONSTANTS.TRADING_LIMITS.MIN_SELL_ARB} ARB`);
      return;
    }
    if (balances && numAmount > balances.arb.available) {
      toast.error('Insufficient available ARB balance');
      return;
    }
    if (!selectedCollectionId) {
      toast.error('Please select or add a receiving Bank Account or UPI');
      return;
    }

    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin: string) => {
    setShowPinModal(false);
    setLoading(true);
    try {
      const res = await fetch('/api/orders/sell/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAmount: numAmount,
          collectionMethodId: selectedCollectionId,
          paymentPin: pin,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create sell order');
      }

      toast.success('Sell order published and ARB locked in escrow!');
      router.push(`/order/detail?id=${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Sell order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 flex flex-col">
      <Header title="C2C Flash Sell ARB" showBack={false} rightAction="service" />

      <main className="p-4 space-y-4">
        {/* Available Balance Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Available to Sell</span>
            <Link href="/wallet" className="text-xs text-amber-400 font-semibold hover:underline">
              Wallet Overview
            </Link>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {formatARB(balances?.arb?.available || 0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (≈ {formatINR((balances?.arb?.available || 0) * CONSTANTS.RATES.ARB_TO_INR)})
            </span>
          </div>
        </div>

        {/* Sell Form */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Sell Amount (ARB)
              </label>
              <button
                type="button"
                onClick={() => setTokenAmount(String(balances?.arb?.available || 0))}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                MAX
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter ARB amount"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-lg font-bold font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-4 font-bold text-sm text-slate-500">ARB</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['10', '50', '100', '500'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTokenAmount(amt)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  tokenAmount === amt
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {amt} ARB
              </button>
            ))}
          </div>

          {/* Expected Fiat Payout */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Locked Unit Price</span>
              <span className="font-bold text-slate-900 font-mono">1 ARB = ₹100.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Trading Fee</span>
              <span className="font-bold text-emerald-600">0.00 ARB (Free)</span>
            </div>
            <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">You Receive (Fiat)</span>
              <span className="text-lg font-extrabold text-amber-700 font-mono">
                {formatINR(expectedINR)}
              </span>
            </div>
          </div>

          {/* Collection Method Picker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Receiving Account
              </label>
              <Link
                href="/main/addCollection"
                className="text-xs text-amber-600 font-semibold flex items-center hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Account
              </Link>
            </div>

            {collections.length === 0 ? (
              <Link
                href="/main/addCollection"
                className="p-4 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center text-center bg-amber-50/40 hover:bg-amber-50 transition"
              >
                <CreditCard className="w-6 h-6 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-amber-800">No Collection Method Bound</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Click here to bind Bank or UPI ID</span>
              </Link>
            ) : (
              <div className="space-y-2">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                      selectedCollectionId === col.id
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="collection"
                        checked={selectedCollectionId === col.id}
                        onChange={() => setSelectedCollectionId(col.id)}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {col.type === 'UPI' ? `UPI: ${col.upiId}` : `${col.bankName} (${col.accountNumber})`}
                        </p>
                        <p className="text-[11px] text-slate-500">Holder: {col.realName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {col.type}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleStartSell}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/25 active:scale-[0.98] transition disabled:opacity-50 mt-2"
          >
            <ArrowUpRight className="w-5 h-5 font-bold" />
            <span>{loading ? 'Processing Escrow Lock...' : 'Sell Out ARB Now'}</span>
          </button>

          <div className="flex items-start space-x-2 text-[11px] text-slate-500 pt-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your ARB is securely locked in platform smart escrow. Only confirm arrival after checking your personal bank/UPI statement.
            </span>
          </div>
        </div>
      </main>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSubmit}
        title="Authorize ARB Sell Escrow"
        description="Enter your 6-digit Payment PIN to lock ARB tokens in C2C trading escrow."
      />

      <TabBar />
    </div>
  );
}
