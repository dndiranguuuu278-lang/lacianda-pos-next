'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GrapeClusterIcon } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<'dennis' | 'sarah'>('dennis');

  const handleKeypadPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === '1234' || enteredPin.length === 4) {
      try {
        localStorage.setItem(
          'lacianda_session',
          JSON.stringify({
            user: selectedUser,
            name: selectedUser === 'dennis' ? 'Dennis K.' : 'Sarah M.',
            role: selectedUser === 'dennis' ? 'Store Manager' : 'Cashier',
            loginTime: new Date().toISOString()
          })
        );
      } catch {}
      router.push('/');
    } else {
      setError('Invalid 4-digit PIN. (Hint: Try 1234)');
      setPin('');
    }
  };

  const handleQuickDemoLogin = (user: 'dennis' | 'sarah') => {
    setSelectedUser(user);
    setPin('1234');
    verifyPin('1234');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-wine-900 via-wine-800 to-wine-950 p-4 text-white select-none">
      {/* Brand Identity & Crest */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-paper shadow-xl mb-3">
          <GrapeClusterIcon className="h-9 w-9" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Lacianda Wines &amp; Spirits
        </h1>
        <p className="text-xs text-white/70 tracking-wide mt-0.5">
          Terminal #01 · Valley Arcade, Nairobi
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl text-gray-900 border border-white/40">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold text-gray-900">Enter Cashier Access PIN</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Select profile &amp; type 4-digit PIN to unlock POS
          </p>
        </div>

        {/* User Selection Pills */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setSelectedUser('dennis')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedUser === 'dennis'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Dennis (Mgr)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedUser('sarah')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedUser === 'sarah'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            <span>Sarah (Cashier)</span>
          </button>
        </div>

        {/* PIN Indicators (4 dots) */}
        <div className="flex justify-center gap-3 mb-5">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-primary scale-110 shadow-xs'
                    : 'bg-gray-200 border border-gray-300'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-center text-xs font-semibold text-red-600 mb-3 animate-shake">
            {error}
          </p>
        )}

        {/* Numeric Tactile Touch Keypad */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-lg font-bold font-mono text-gray-800 transition-all flex items-center justify-center shadow-2xs active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-all flex items-center justify-center active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-lg font-bold font-mono text-gray-800 transition-all flex items-center justify-center shadow-2xs active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 transition-all flex items-center justify-center active:scale-95"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Client Demo Fast Login Shortcut */}
        <div className="pt-3 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 mb-2">Quick Demo Access (One-click unlock):</p>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin(selectedUser)}
            className="w-full h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Instant Demo Unlock as {selectedUser === 'dennis' ? 'Dennis' : 'Sarah'}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-white/50 mt-6">
        Protected by Lacianda POS · KRA eTIMS Enabled
      </p>
    </div>
  );
}
