'use client';

import { useState } from 'react';
import type { SettingsTab } from '@/types';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [saveBanner, setSaveBanner] = useState(false);

  // Store & Brand
  const [storeName, setStoreName] = useState('Lacianda Wines and Spirits');
  const [branchName, setBranchName] = useState('Valley Arcade Branch, Nairobi');
  const [kraPin, setKraPin] = useState('P051982734Z');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for choosing Lacianda Wines & Spirits. Please drink responsibly.');

  // M-Pesa
  const [buyGoodsNumber, setBuyGoodsNumber] = useState('9841234');
  const [paybillNumber, setPaybillNumber] = useState('222111');
  const [paybillAccount, setPaybillAccount] = useState('281552');
  const [pochiNumber, setPochiNumber] = useState('0720087714');
  const [enableStkPush, setEnableStkPush] = useState(true);

  // eTIMS
  const [oscuUrl, setOscuUrl] = useState('https://etims-api.kra.go.ke/etims-oscu/v1');
  const [autoSyncEtims, setAutoSyncEtims] = useState(true);

  // Hardware / Printing
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);

  // Security
  const [managerPin, setManagerPin] = useState('1234');
  const [allowOversell, setAllowOversell] = useState(false);

  const handleSaveSettings = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Terminal &amp; Store Configuration</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure M-Pesa merchant tills, KRA eTIMS keys, thermal printer width, and cashier security
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="self-start sm:self-auto px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-wine-800 active:scale-98 transition-all shadow-sm flex items-center gap-2"
        >
          <span>Save Changes</span>
        </button>
      </div>

      {saveBanner && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Settings saved and synchronized with local POS terminal!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'store', label: 'Store & Branding' },
          { id: 'mpesa', label: 'M-Pesa Merchant Settings' },
          { id: 'etims', label: 'KRA eTIMS Fiscal' },
          { id: 'hardware', label: 'Thermal Printer' },
          { id: 'security', label: 'Staff & Security' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="max-w-3xl">
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Store Profile &amp; Receipt Header</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Branch / Location</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">KRA PIN</label>
              <input
                type="text"
                value={kraPin}
                onChange={(e) => setKraPin(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold focus:bg-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt Footer Note</label>
              <textarea
                rows={3}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>
        )}

        {activeTab === 'mpesa' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">M-Pesa Merchant Integration</h2>
                <p className="text-[11px] text-gray-500">Configure Lipa Na M-Pesa Buy Goods, Paybill, and STK Push</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Daraja API Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Buy Goods / Till Number</label>
                <input
                  type="text"
                  value={buyGoodsNumber}
                  onChange={(e) => setBuyGoodsNumber(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pochi la Biashara Phone</label>
                <input
                  type="text"
                  value={pochiNumber}
                  onChange={(e) => setPochiNumber(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Paybill Business Number</label>
                <input
                  type="text"
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Paybill Account Reference</label>
                <input
                  type="text"
                  value={paybillAccount}
                  onChange={(e) => setPaybillAccount(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Enable Instant STK Push Prompt</h4>
                <p className="text-[11px] text-gray-500">Prompts customer phone with PIN request automatically on checkout</p>
              </div>
              <input
                type="checkbox"
                checked={enableStkPush}
                onChange={(e) => setEnableStkPush(e.target.checked)}
                className="h-5 w-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'etims' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">KRA eTIMS Fiscal Compliance</h2>
            <p className="text-xs text-gray-500">Connect to KRA Online Sales Control Unit (OSCU) or VSCU proxy</p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">OSCU Endpoint URL</label>
              <input
                type="url"
                value={oscuUrl}
                onChange={(e) => setOscuUrl(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Auto-Fiscalize Every Sale Immediately</h4>
                <p className="text-[11px] text-gray-500">Transmits invoice immediately upon charge completion</p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEtims}
                onChange={(e) => setAutoSyncEtims(e.target.checked)}
                className="h-5 w-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Thermal Receipt Printer</h2>
            <p className="text-xs text-gray-500">Select standard POS thermal paper roll specification</p>

            <div className="grid grid-cols-2 gap-3">
              {(['80mm', '58mm'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPaperWidth(w)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    paperWidth === w
                      ? 'border-primary bg-primary/5 font-bold text-primary'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-sm">{w} Paper Roll</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {w === '80mm' ? 'Standard 3-inch Desktop Printer' : 'Compact 2-inch Mobile Bluetooth'}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Auto-Print Receipt Dialog</h4>
                <p className="text-[11px] text-gray-500">Opens thermal receipt printing preview after sale</p>
              </div>
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                className="h-5 w-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Staff &amp; Cashier Access Control</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Manager Override PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength={4}
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                className="w-48 h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Allow Overselling Below 0 Stock</h4>
                <p className="text-[11px] text-gray-500">Permits cashier to ring up bottles even if recorded count is 0</p>
              </div>
              <input
                type="checkbox"
                checked={allowOversell}
                onChange={(e) => setAllowOversell(e.target.checked)}
                className="h-5 w-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
