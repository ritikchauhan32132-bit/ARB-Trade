'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import Badge from '@/components/Badge';
import { formatINR, formatARB } from '@/lib/utils';
import { FileText, ArrowDownLeft, ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders${filterType !== 'ALL' ? `?type=${filterType}` : ''}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filterType]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 flex flex-col">
      <Header title="Trading Orders" showBack={false} rightAction="service" />

      <main className="p-4 space-y-4">
        {/* Type Filter Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          {['ALL', 'BUY', 'SELL'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                filterType === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'ALL' ? 'All Orders' : t === 'BUY' ? 'Buy Orders' : 'Sell Orders'}
            </button>
          ))}
        </div>

        {/* Orders Stream */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">No Orders Found</p>
              <p className="text-xs text-slate-400 mt-1">
                Your buy and sell trading transactions will appear here.
              </p>
              <div className="mt-4 flex justify-center space-x-3">
                <Link
                  href="/buy/arb"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm"
                >
                  Buy ARB
                </Link>
                <Link
                  href="/sell"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Sell ARB
                </Link>
              </div>
            </div>
          ) : (
            orders.map((ord) => (
              <Link
                key={ord.id}
                href={`/order/detail?id=${ord.id}`}
                className="block p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition active:scale-[0.99]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        ord.type === 'BUY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-900 text-amber-400'
                      }`}
                    >
                      {ord.type === 'BUY' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 uppercase">
                        {ord.type} ARB
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">#{ord.orderNumber}</p>
                    </div>
                  </div>
                  <Badge status={ord.status} />
                </div>

                <div className="pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500">Fiat Amount:</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      {formatINR(ord.fiatAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Token Amount:</span>
                    <p className="font-bold text-amber-600 font-mono text-sm">
                      {formatARB(ord.tokenAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(ord.createdAt).toLocaleString()}
                  </span>
                  <span className="text-amber-600 font-semibold flex items-center">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <TabBar />
    </div>
  );
}
