'use client';

import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  description?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter Payment PIN',
  description = 'Please enter your 6-digit fund password to authorize this financial action.',
}) => {
  const [pin, setPin] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => {
          onSuccess(newPin);
          setPin('');
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-slide-up">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mb-6">{description}</p>

        {/* PIN Indicators */}
        <div className="flex space-x-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                pin.length > idx
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {pin.length > idx && (
                <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
              )}
            </div>
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
            (key, i) => {
              if (key === '') {
                return <div key={i} />;
              }
              if (key === 'del') {
                return (
                  <button
                    key={i}
                    onClick={handleDelete}
                    className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-700 transition"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  onClick={() => handleDigit(key)}
                  className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-amber-100 active:border-amber-400 border border-transparent font-bold text-xl text-slate-800 transition"
                >
                  {key}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default PinModal;
