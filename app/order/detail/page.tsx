'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import PinModal from '@/components/PinModal';
import QrCodeView from '@/components/QrCodeView';
import { formatINR, formatARB } from '@/lib/utils';
import {
  Clock,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function OrderDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const [ordRes, meRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch('/api/auth/me'),
      ]);
      const ordData = await ordRes.json();
      const meData = await meRes.json();

      if (ordData.success) setOrder(ordData.data);
      if (meData.success) setCurrentUser(meData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [orderId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!utrNumber || utrNumber.length < 6) {
      toast.error('Please enter a valid 12-digit UPI UTR / Bank Reference Number');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utrNumber }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to confirm payment');
      }

      toast.success('Payment proof submitted! Awaiting verification.');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || 'Payment confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmArrival = async (pin: string) => {
    setShowPinModal(false);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPin: pin }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Confirmation failed');
      }

      toast.success('Payment arrival confirmed! Escrow ARB released.');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Cancellation failed');
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Header title="Order Details" showBack={true} />
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Header title="Order Details" showBack={true} />
        <div className="p-8 text-center">
          <p className="text-sm font-bold text-slate-700">Order Not Found</p>
          <Link href="/order" className="mt-4 inline-block px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = currentUser?.id === order.buyerId;
  const isSeller = currentUser?.id === order.sellerId;

  // Build UPI Deep-Link string
  const upiDeepLink = order.payeeUpi
    ? `upi://pay?pa=${encodeURIComponent(order.payeeUpi)}&pn=${encodeURIComponent(
        order.payeeName || 'AR WALLET CASHIER'
      )}&am=${order.fiatAmount}&cu=INR&tn=${encodeURIComponent(order.orderNumber)}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 flex flex-col">
      <Header title={`Order #${order.orderNumber}`} showBack={true} rightAction="service" />

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Status Header Banner */}
        <div
          className={`p-5 rounded-3xl text-white shadow-md ${
            order.status === 'COMPLETED'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
              : order.status === 'PAID_BY_BUYER'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : order.status === 'CANCELLED' || order.status === 'TIMEOUT'
              ? 'bg-gradient-to-r from-slate-700 to-slate-800'
              : order.status === 'APPEALED'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wide">
              {order.type} ARB ORDER
            </span>
            <Badge status={order.status} />
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black font-mono">{formatINR(order.fiatAmount)}</p>
              <p className="text-xs opacity-90 font-mono mt-0.5">
                ≈ {formatARB(order.tokenAmount)} (@ ₹{order.unitPrice}/ARB)
              </p>
            </div>
            {order.status === 'PENDING_PAYMENT' && (
              <div className="flex items-center space-x-1 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>15:00 Expiry</span>
              </div>
            )}
          </div>
        </div>

        {/* Cashier / Payee Payment Card (When Pending Payment for Buyer) */}
        {order.type === 'BUY' && order.status === 'PENDING_PAYMENT' && isBuyer && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
                Matched Cashier Payee
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Payee
              </span>
            </div>

            {/* UPI QR Display */}
            {order.payeeUpi && (
              <div className="flex flex-col items-center">
                <QrCodeView value={upiDeepLink || order.payeeUpi} label="Scan with any UPI App (GPay / PhonePe / Paytm)" />
                {upiDeepLink && (
                  <a
                    href={upiDeepLink}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm active:scale-95 transition"
                  >
                    <span>Open in UPI App (Instant Pay)</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            )}

            {/* Bank / Payee Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payee Name:</span>
                <span className="font-bold text-slate-900">{order.payeeName || 'Cashier Desk'}</span>
              </div>
              {order.payeeUpi && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payee UPI ID:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono font-bold text-amber-700">{order.payeeUpi}</span>
                    <button
                      onClick={() => copyToClipboard(order.payeeUpi, 'upi')}
                      className="p-1 text-slate-400 hover:text-amber-600"
                    >
                      {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
              {order.payeeAccount && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-bold text-slate-900">{order.payeeBank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Number:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono font-bold text-slate-900">{order.payeeAccount}</span>
                      <button
                        onClick={() => copyToClipboard(order.payeeAccount, 'acc')}
                        className="p-1 text-slate-400 hover:text-amber-600"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">IFSC Code:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono font-bold text-slate-900">{order.payeeIfsc}</span>
                      <button
                        onClick={() => copyToClipboard(order.payeeIfsc, 'ifsc')}
                        className="p-1 text-slate-400 hover:text-amber-600"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Step 2: Submit UTR */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
                Step 2: Submit 12-Digit UPI UTR / Ref Number *
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Enter 12-digit UTR from your UPI payment"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={actionLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-amber-400/25 active:scale-[0.98] transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 font-bold" />
              <span>{actionLoading ? 'Submitting...' : 'I Have Paid (Submit UTR)'}</span>
            </button>

            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition"
            >
              Cancel Order
            </button>
          </div>
        )}

        {/* Seller Actions (When Sell Order is Paid by Buyer, seller confirms arrival) */}
        {order.type === 'SELL' && isSeller && order.status === 'PAID_BY_BUYER' && (
          <div className="bg-amber-50 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Buyer Has Marked Payment!</span>
            </div>

            <p className="text-xs text-slate-700">
              Buyer submitted UTR: <strong className="font-mono text-slate-900">{order.utrNumber || 'N/A'}</strong>. Please check your bank statement to confirm you received{' '}
              <strong className="text-amber-800">{formatINR(order.fiatAmount)}</strong>.
            </p>

            <button
              onClick={() => setShowPinModal(true)}
              disabled={actionLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/30 active:scale-[0.98] transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Arrival & Release ARB</span>
            </button>

            <Link
              href={`/order/appeal?id=${order.id}`}
              className="block text-center text-xs text-rose-600 font-bold hover:underline"
            >
              Payment not received? Open Dispute Appeal
            </Link>
          </div>
        )}

        {/* Dispute / Appeal Shortcut for any active order */}
        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <div className="text-center pt-2">
            <Link
              href={`/order/appeal?id=${order.id}`}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium inline-flex items-center"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Have an issue with this order? Submit Appeal
            </Link>
          </div>
        )}
      </main>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleConfirmArrival}
        title="Confirm Payment Arrival"
        description="Enter your 6-digit Payment PIN to release frozen ARB tokens to the buyer."
      />
    </div>
  );
}
