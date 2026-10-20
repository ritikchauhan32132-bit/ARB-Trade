'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Award, FileText, ArrowDownCircle, User } from 'lucide-react';

export const TabBar: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/task', label: 'Task', icon: Award },
    { href: '/sell', label: 'Sell', icon: ArrowDownCircle, highlight: true },
    { href: '/order', label: 'Order', icon: FileText },
    { href: '/main', label: 'My', icon: User },
  ];

  // Don't display TabBar on login, register, forgot, or admin routes
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot' ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around h-16">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/home' && pathname.startsWith(tab.href));
        const Icon = tab.icon;

        if (tab.highlight) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center -mt-6 group focus:outline-none"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-brand-yellow to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/40 border-4 border-white active:scale-95 transition-transform">
                <Icon className="w-7 h-7 text-slate-900 font-bold" />
              </div>
              <span className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-amber-600' : 'text-slate-600'}`}>
                {tab.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-500' : ''}`} />
            <span className="text-[11px] mt-1">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TabBar;
