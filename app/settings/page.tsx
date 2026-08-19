'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function SettingsPage() {
  const [phone, setPhone] = useState('0720087714');
  const [headerText, setHeaderText] = useState('Lacianda Wines and Spirits, Thank You for Your Business!');
  const [chargeVat, setChargeVat] = useState(true);
  const [vatRate, setVatRate] = useState('16');
  const [autoPrint, setAutoPrint] = useState(true);
  const [pinVoid, setPinVoid] = useState(true);

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-4xl w-full mx-auto p-6 space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Configure account details, billing, eTIMS taxes, receipt printing, and cashier PIN security.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Account & Security</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Receipt Header</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Header Text</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Billing & Taxes</h2>
          <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Charge VAT ({vatRate}%)</span>
              <span className="text-[11px] text-slate-400">Applies standard tax calculation to checkout totals.</span>
            </div>
            <input
              type="checkbox"
              checked={chargeVat}
              onChange={() => setChargeVat(!chargeVat)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-700 focus:ring-amber-700"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Till Behavior & Security</h2>
          <div className="flex items-center justify-between bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Require PIN to Void Sale</span>
            </div>
            <input
              type="checkbox"
              checked={pinVoid}
              onChange={() => setPinVoid(!pinVoid)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-700 focus:ring-amber-700"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
          >
            Save All Settings
          </button>
        </div>
      </main>
    </div>
  );
}
