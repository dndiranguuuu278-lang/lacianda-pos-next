'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function SettingsPage() {
  const [phoneNumber, setPhoneNumber] = useState('0720087714');
  const [personalMode, setPersonalMode] = useState(true);
  const [buyGoods, setBuyGoods] = useState(true);
  const [paybill, setPaybill] = useState(true);
  const [pochi, setPochi] = useState(true);
  const [stkPush, setStkPush] = useState(false);
  const [etimsStaging, setEtimsStaging] = useState(true);
  const [kraPin, setKraPin] = useState('P0XXXXXXXXX');
  const [darkMode, setDarkMode] = useState(false);
  const [receiptHeader, setReceiptHeader] = useState('Lacianda Wines and Spirits, Thank You for Your Business!');
  const [chargeVat, setChargeVat] = useState(true);
  const [vatRate, setVatRate] = useState('16');
  const [chargeLevy, setChargeLevy] = useState(true);
  const [levyRate, setLevyRate] = useState('2.5');
  const [autoPrint, setAutoPrint] = useState(true);
  const [paperWidth, setPaperWidth] = useState('58mm (small thermal printer)');
  const [requirePinVoid, setRequirePinVoid] = useState(true);
  const [requirePinDiscount, setRequirePinDiscount] = useState(false);
  const [allowZeroStock, setAllowZeroStock] = useState(false);

  const themeColors = ['bg-amber-900', 'bg-red-600', 'bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-slate-800', 'bg-amber-700'];
  const [selectedColor, setSelectedColor] = useState('bg-amber-900');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

        {/* Account Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">Account</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Your phone number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">Used for M-Pesa (Personal mode) and to recover your PIN.</p>
          </div>
          <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Change PIN
          </button>
        </div>

        {/* M-Pesa Payment Modes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">M-Pesa payment modes</h2>
          <p className="text-xs text-slate-500">Turn on every mode you actually accept — the till shows a picker at checkout when more than one is on.</p>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Personal number (Send Money)</span>
              <input type="checkbox" checked={personalMode} onChange={() => setPersonalMode(!personalMode)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Buy Goods (Till number)</span>
              <input type="checkbox" checked={buyGoods} onChange={() => setBuyGoods(!buyGoods)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            {buyGoods && (
              <div>
                <input type="text" placeholder="Till number" className="w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Paybill</span>
              <input type="checkbox" checked={paybill} onChange={() => setPaybill(!paybill)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Pochi la Biashara</span>
              <input type="checkbox" checked={pochi} onChange={() => setPochi(!pochi)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">STK Push (prompt-to-pay)</span>
              <input type="checkbox" checked={stkPush} onChange={() => setStkPush(!stkPush)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
          </div>
        </div>

        {/* KRA eTIMS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">KRA eTIMS</h2>
          <p className="text-xs text-slate-500">Classifies every sale line by tax type and stages a correctly-shaped invoice per sale. Actual submission to KRA still needs your approved eTIMS device/middleware.</p>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Enable eTIMS staging</span>
            <input type="checkbox" checked={etimsStaging} onChange={() => setEtimsStaging(!etimsStaging)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">KRA PIN</label>
            <input
              type="text"
              value={kraPin}
              onChange={(e) => setKraPin(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>
        </div>

        {/* Branding & Theme */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">Branding & theme</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Theme color</label>
            <div className="flex gap-3">
              {themeColors.map((colorClass, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(colorClass)}
                  className={`w-7 h-7 rounded-full ${colorClass} ${selectedColor === colorClass ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-sm font-medium text-slate-700 block">Dark mode</span>
              <span className="text-xs text-slate-400">Switch the whole app to a dark background.</span>
            </div>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Receipt header text</label>
            <input
              type="text"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">Billing</h2>
          <p className="text-xs text-slate-500">Turn these off or change the rate if your shop isn’t VAT-registered or the rate changes.</p>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Charge VAT</span>
              <input type="checkbox" checked={chargeVat} onChange={() => setChargeVat(!chargeVat)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            {chargeVat && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">VAT rate (%)</label>
                <input
                  type="text"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Charge catering levy</span>
              <input type="checkbox" checked={chargeLevy} onChange={() => setChargeLevy(!chargeLevy)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
            </div>
            {chargeLevy && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Catering levy rate (%)</label>
                <input
                  type="text"
                  value={levyRate}
                  onChange={(e) => setLevyRate(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Receipts & Printing */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">Receipts & printing</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Auto-print receipt after checkout</span>
            <input type="checkbox" checked={autoPrint} onChange={() => setAutoPrint(!autoPrint)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Receipt/printer paper width</label>
            <select
              value={paperWidth}
              onChange={(e) => setPaperWidth(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option>58mm (small thermal printer)</option>
              <option>80mm (standard thermal printer)</option>
            </select>
          </div>
        </div>

        {/* Till Behavior */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">Till behavior</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Require your PIN to void a sale</span>
            <input type="checkbox" checked={requirePinVoid} onChange={() => setRequirePinVoid(!requirePinVoid)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Require your PIN to apply a discount</span>
            <input type="checkbox" checked={requirePinDiscount} onChange={() => setRequirePinDiscount(!requirePinDiscount)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Allow selling below zero stock (oversell)</span>
            <input type="checkbox" checked={allowZeroStock} onChange={() => setAllowZeroStock(!allowZeroStock)} className="h-4 w-4 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={() => alert('Settings saved successfully!')}
            className="bg-amber-900 hover:bg-amber-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Save settings
          </button>
        </div>
      </main>
    </div>
  );
}
