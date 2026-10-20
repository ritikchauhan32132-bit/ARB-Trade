'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import QrCodeView from '@/components/QrCodeView';
import { ShieldCheck, ArrowRight, Upload, History } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UsdtRechargePage() {
  const router = useRouter();
  const [network, setNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [depositData, setDepositData] = useState<any>(null);
  const [amount, setAmount] = useState<string>('50');
  const [txHash, setTxHash] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/usdt/recharge')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDepositData(d.data);
      });
  }, []);

  const activeAddress =
    network === 'TRC20'
      ? depositData?.trc20Address || 'TX7kR4Zp9eW2Yn6Mb8v3QqL1s0Cd5Ef8Gh'
      : depositData?.erc20Address || '0x71C836067b5e43a9019623eE0C06A91187d9A3bc';

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount < 10) {
      toast.error('Minimum deposit amount is 10 USDT');
      return;
    }
    if (!txHash || txHash.length < 10) {
      toast.error('Please enter a valid on-chain transaction hash (TxID)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/usdt/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          amount: numAmount,
          txHash,
          proofImageUrl: '/uploads/sample_tx_proof.jpg',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Deposit submission failed');
      }

      toast.success('USDT deposit submitted! Awaiting blockchain verification.');
      router.push('/usdt/recharge/success');
    } catch (err: any) {
      toast.error(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header
        title="USDT Recharge / Deposit"
        showBack={true}
        rightAction={
          <Link href="/usdt/recharge/record" className="text-slate-600 hover:text-slate-900 p-1">
            <History className="w-5 h-5" />
          </Link>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Network Selector */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
            Select Deposit Network
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['TRC20', 'ERC20'] as const).map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setNetwork(net)}
                className={`py-2.5 rounded-2xl font-bold text-xs border transition ${
                  network === net
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                USDT-{net}
              </button>
            ))}
          </div>

          {/* QR Code and Address */}
          <div className="pt-2">
            <QrCodeView value={activeAddress} size={160} label={`Deposit Address (USDT-${network})`} />
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Send only USDT ({network}) to this address. 1 block confirmation required. Minimum deposit 10 USDT.
          </p>
        </div>

        {/* Step 2: Submit TxID Hash */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
            Step 2: Submit Transfer Hash (TxID)
          </h3>

          <form onSubmit={handleSubmitProof} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                USDT Amount Deposited
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Transaction Hash (TxID) *
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste blockchain transaction hash"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md shadow-amber-400/25 active:scale-[0.98] transition disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Submitting...' : 'Submit Deposit Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
