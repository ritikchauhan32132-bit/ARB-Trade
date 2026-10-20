'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PinModal from '@/components/PinModal';
import { formatUSDT } from '@/lib/utils';
import { CONSTANTS } from '@/lib/constants';
import { ShieldCheck, ArrowRight, History } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UsdtWithdrawalPage() {
  const router = useRouter();
  const [balances, setBalances] = useState<any>(null);
  const [network, setNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/wallet/balances')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBalances(d.data);
      });
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const fee = CONSTANTS.TRADING_LIMITS.WITHDRAW_FEE_USDT;
  const netAmount = Math.max(0, numAmount - fee);

  const handleStartWithdraw = () => {
    if (!address || address.length < 20) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    if (numAmount < CONSTANTS.TRADING_LIMITS.MIN_WITHDRAW_USDT) {
      toast.error(`Minimum withdrawal is ${CONSTANTS.TRADING_LIMITS.MIN_WITHDRAW_USDT} USDT`);
      return;
    }
    if (balances && numAmount > balances.usdt.available) {
      toast.error('Insufficient available USDT balance');
      return;
    }

    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin: string) => {
    setShowPinModal(false);
    setLoading(true);
    try {
      const res = await fetch('/api/usdt/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          address,
          amount: numAmount,
          paymentPin: pin,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Withdrawal request failed');
      }

      toast.success('Withdrawal request submitted for on-chain audit!');
      router.push('/usdt/wthdrawal/record');
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header
        title="USDT Withdrawal"
        showBack={true}
        rightAction={
          <Link href="/usdt/wthdrawal/record" className="text-slate-600 hover:text-slate-900 p-1">
            <History className="w-5 h-5" />
          </Link>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Balance Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Available USDT</span>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {formatUSDT(balances?.usdt?.available || 0)}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
              Select Network
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
              Destination Address ({network}) *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter destination ${network} address`}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Withdrawal Amount (USDT) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(balances?.usdt?.available || 0))}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                MAX
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min 10 USDT"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-4 font-bold text-xs text-slate-500">USDT</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Network Fee:</span>
              <span className="font-bold text-slate-800 font-mono">{fee} USDT</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-800">Actual Amount Received:</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">
                {netAmount.toFixed(2)} USDT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartWithdraw}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md shadow-amber-400/25 active:scale-[0.98] transition disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{loading ? 'Submitting...' : 'Authorize Withdrawal'}</span>
          </button>
        </div>
      </main>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSubmit}
        title="Authorize USDT Payout"
        description="Enter your 6-digit Payment PIN to sign and broadcast the on-chain payout transaction."
      />
    </div>
  );
}
