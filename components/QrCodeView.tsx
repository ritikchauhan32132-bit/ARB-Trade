'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QrCodeViewProps {
  value: string;
  size?: number;
  label?: string;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  value,
  size = 180,
  label,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: '#1F262F',
          light: '#FFFFFF',
        },
      })
        .then(setDataUrl)
        .catch(console.error);
    }
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR Code"
          className="rounded-xl shadow-inner border border-slate-100"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="bg-slate-100 animate-pulse rounded-xl"
          style={{ width: size, height: size }}
        />
      )}

      {label && (
        <p className="text-xs text-slate-500 font-medium mt-3 text-center">
          {label}
        </p>
      )}

      <div className="mt-3 w-full flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
        <span className="font-mono text-slate-700 truncate mr-2 select-all">
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-amber-600 font-semibold hover:text-amber-700 active:scale-95 shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};

export default QrCodeView;
