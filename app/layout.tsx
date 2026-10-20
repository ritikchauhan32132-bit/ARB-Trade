import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AR Wallet — C2C Crypto Settlement Platform',
  description: 'Fast, secure, decentralized P2P and Cashier settlement wallet with multi-tier KYC and VIP rewards.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAC10C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-brand-darker min-h-screen text-slate-900 flex justify-center">
        <div className="app-container">
          {children}
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}
