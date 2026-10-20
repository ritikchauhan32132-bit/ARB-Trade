'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Headphones, Bell, Globe } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: 'service' | 'notice' | 'lang' | 'none' | React.ReactNode;
  transparent?: boolean;
  dark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction = 'service',
  transparent = false,
  dark = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 h-14 ${
        transparent
          ? 'bg-transparent'
          : dark
          ? 'bg-brand-dark text-white border-b border-brand-border'
          : 'bg-white text-slate-800 border-b border-slate-100 shadow-sm'
      }`}
    >
      <div className="flex items-center w-1/4">
        {showBack && (
          <button
            onClick={handleBack}
            className={`p-1.5 -ml-1.5 rounded-full active:bg-slate-100 dark:active:bg-slate-800 transition ${
              dark ? 'text-white' : 'text-slate-700'
            }`}
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 text-center font-semibold text-base truncate px-2">
        {title}
      </div>

      <div className="flex items-center justify-end w-1/4 space-x-2">
        {rightAction === 'service' && (
          <Link
            href="/helpCenter"
            className="p-1.5 rounded-full bg-brand-yellow/20 text-brand-gold hover:bg-brand-yellow/30 active:scale-95 transition"
            title="Customer Service"
          >
            <Headphones className="w-5 h-5 text-yellow-600" />
          </Link>
        )}
        {rightAction === 'notice' && (
          <Link
            href="/main/notice"
            className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition text-slate-600"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>
        )}
        {rightAction === 'lang' && (
          <Link
            href="/main/lang"
            className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition text-slate-600"
            title="Language"
          >
            <Globe className="w-5 h-5" />
          </Link>
        )}
        {typeof rightAction === 'object' && rightAction}
      </div>
    </header>
  );
};

export default Header;
