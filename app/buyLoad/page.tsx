'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function BuyLoadPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/buy/arb');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
      <h2 className="text-base font-bold text-white">Connecting Liquidity Nodes...</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Matching high-speed UPI / Bank cashier settlement channels.
      </p>
    </div>
  );
}
