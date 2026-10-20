'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter your account and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed');
      }

      toast.success('Login successful! Welcome back.');
      router.push('/home');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: 'user' | 'admin' | 'cashier') => {
    if (type === 'user') {
      setIdentifier('demouser');
      setPassword('password123');
    } else if (type === 'admin') {
      setIdentifier('admin');
      setPassword('admin123456');
    } else {
      setIdentifier('cashier');
      setPassword('cashier123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6">
      {/* Top Brand Banner */}
      <div className="pt-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-yellow to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4">
          <ShieldCheck className="w-10 h-10 text-slate-950 font-bold" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AR WALLET</h1>
        <p className="text-xs text-slate-400 mt-1">High-Speed C2C Crypto Settlement Platform</p>
      </div>

      {/* Login Form Card */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700/60 shadow-xl my-auto">
        <h2 className="text-lg font-bold text-white mb-5">Account Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Account / Phone / Email
            </label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, email, or phone"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter login password"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link href="/forgot" className="text-xs text-amber-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/25 active:scale-[0.98] transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <p className="text-[11px] font-medium text-slate-400 mb-2 text-center">
            One-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-amber-400 font-medium transition"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('cashier')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-emerald-400 font-medium transition"
            >
              Cashier
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-rose-400 font-medium transition"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Register CTA */}
      <div className="text-center pb-4">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-amber-400 font-bold hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
