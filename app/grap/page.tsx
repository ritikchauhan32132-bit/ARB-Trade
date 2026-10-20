'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Zap, Play, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GrapPage() {
  const [grabbing, setGrabbing] = useState(false);

  const handleStartGrab = () => {
    setGrabbing(true);
    setTimeout(() => {
      setGrabbing(false);
      toast.success('Grabbed 1 High-Yield Settlement Order!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      <Header title="Flash Order Grabbing" showBack={true} />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full text-center">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-400/40">
            <Zap className={`w-10 h-10 ${grabbing ? 'animate-bounce' : ''}`} />
          </div>
          <h2 className="text-lg font-bold text-white">Automated Order Match</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Grab high-frequency peer orders to earn instant 0.5% liquidity rebate commissions.
          </p>

          <button
            onClick={handleStartGrab}
            disabled={grabbing}
            className="mt-6 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-400/30 active:scale-95 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{grabbing ? 'Matching Node Liquidity...' : 'Start Grabbing Orders'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
