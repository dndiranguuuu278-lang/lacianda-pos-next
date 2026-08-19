'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
  // Account & Phone
  const [phoneNumber, setPhoneNumber] = useState('0720087714');
  
  // M-Pesa Modes
  const [enablePersonal, setEnablePersonal] = useState(true);
  const [enableTill, setEnableTill] = useState(true);
  const [tillNumber, setTillNumber] = useState('');
  const [enablePaybill, setEnablePaybill] = useState(false);
  const [paybillNumber, setPaybillNumber] = useState('222111');
  const [enablePochi, setEnablePochi] = useState(true);
  const [pochiNumber, setPochiNumber] = useState('281552');
  const [enableStk, setEnableStk] = useState(false);
  const [stkServerUrl, setStkServerUrl] = useState('https://your-server.example.com');

  // KRA eTIMS
  const [enableEtims, setEnableEtims] = useState(true);
  const [kraPin, setKraPin] = useState('P0XXXXXXXXX');

  // Billing
  const [chargeVat, setChargeVat] = useState(true);
  const [vatRate, setVatRate] = useState('16');
  const [chargeLevy, setChargeLevy] = useState(true);
  const [levyRate, setLevyRate] = useState('2.5');

  // Branding & Theme
  const [selectedTheme, setSelectedTheme] = useState('amber');
  const [darkMode, setDarkMode] = useState(false);
  const [receiptHeader, setReceiptHeader] = useState('Lacianda Wines and Spirits, Thank You for Your Business!');

  // Receipts & Printing
  const [autoPrint, setAutoPrint] = useState(true);
  const [paperWidth, setPaperWidth] = useState('58mm (small thermal printer)');

  // Till Behavior
  const [pinToVoid, setPinToVoid] = useState(true);
  const [pinToDiscount, setPinToDiscount] = useState(true);
  const [allowOversell, setAllowOversell] = useState(false);

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsData = {
      phoneNumber,
      mPesa: { enablePersonal, enableTill, tillNumber, enablePaybill, paybillNumber, enablePochi, pochiNumber, enableStk, stkServerUrl },
      etims: { enableEtims, kraPin },
      billing: { chargeVat, vatRate, chargeLevy, levyRate },
      branding: { selectedTheme, darkMode, receiptHeader },
      printing: { autoPrint, paperWidth },
      behavior: { pinToVoid, pinToDiscount, allowOversell }
    };
    localStorage.setItem('lacianda_pos_settings', JSON.stringify(settingsData));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">POS Settings</h1>
          {savedMessage && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-md">
              Settings saved successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Account Section */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your phone number</label>
                <input 
                  type="text" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Used for M-Pesa (Personal mode) and to recover your PIN.</p>
              </div>
              <button type="button" className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                Change PIN
              </button>
            </div>
          </div>

          {/* M-Pesa Payment Modes */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-2">M-Pesa payment modes</h2>
            <p className="text-xs text-gray-500 mb-4">Turn on every mode you actually accept — the till shows a picker at checkout when multiple are active.</p>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Personal number (Send Money)</span>
                <input type="checkbox" checked={enablePersonal} onChange={(e) => setEnablePersonal(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>

              <div className="border-t pt-3">
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <span className="text-sm font-medium">Buy Goods (Till number)</span>
                  <input type="checkbox" checked={enableTill} onChange={(e) => setEnableTill(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                </label>
                {enableTill && (
                  <input 
                    type="text" 
                    placeholder="Till number" 
                    value={tillNumber} 
                    onChange={(e) => setTillNumber(e.target.value)}
                    className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                  />
                )}
              </div>

              <div className="border-t pt-3">
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <span className="text-sm font-medium">Paybill</span>
                  <input type="checkbox" checked={enablePaybill} onChange={(e) => setEnablePaybill(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                </label>
                {enablePaybill && (
                  <input 
                    type="text" 
                    value={paybillNumber} 
                    onChange={(e) => setPaybillNumber(e.target.value)}
                    className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                  />
                )}
              </div>

              <div className="border-t pt-3">
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <span className="text-sm font-medium">Pochi la Biashara</span>
                  <input type="checkbox" checked={enablePochi} onChange={(e) => setEnablePochi(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                </label>
                {enablePochi && (
                  <input 
                    type="text" 
                    value={pochiNumber} 
                    onChange={(e) => setPochiNumber(e.target.value)}
                    className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                  />
                )}
              </div>

              <div className="border-t pt-3">
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <div>
                    <span className="text-sm font-medium">STK Push (prompt-to-pay)</span>
                    <p className="text-xs text-gray-500">Requires your own backend server holding Daraja credentials — this app can't call Safaricom directly from the browser.</p>
                  </div>
                  <input type="checkbox" checked={enableStk} onChange={(e) => setEnableStk(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                </label>
                {enableStk && (
                  <input 
                    type="text" 
                    value={stkServerUrl} 
                    onChange={(e) => setStkServerUrl(e.target.value)}
                    className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* KRA eTIMS */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-2">KRA eTIMS</h2>
            <p className="text-xs text-gray-500 mb-4">Classifies every sale line by tax type and stages a correctly-shaped invoice per sale. Actual submission to KRA still needs your approved eTIMS device/middleware.</p>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Enable eTIMS staging</span>
                <input type="checkbox" checked={enableEtims} onChange={(e) => setEnableEtims(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">KRA PIN</label>
                <input 
                  type="text" 
                  value={kraPin} 
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-2">Billing</h2>
            <p className="text-xs text-gray-500 mb-4">Turn these off or change the rate if your shop isn't VAT-registered or the rate changes.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Charge VAT</span>
                </div>
                <input type="checkbox" checked={chargeVat} onChange={(e) => setChargeVat(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </div>
              {chargeVat && (
                <div className="max-w-xs">
                  <label className="block text-xs text-gray-500 mb-1">VAT rate (%)</label>
                  <input type="text" value={vatRate} onChange={(e) => setVatRate(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-transparent" />
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Charge catering levy</span>
                <input type="checkbox" checked={chargeLevy} onChange={(e) => setChargeLevy(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </div>
              {chargeLevy && (
                <div className="max-w-xs">
                  <label className="block text-xs text-gray-500 mb-1">Catering levy rate (%)</label>
                  <input type="text" value={levyRate} onChange={(e) => setLevyRate(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Branding & Theme */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Branding & theme</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme color</label>
                <div className="flex gap-3">
                  {['maroon', 'red', 'blue', 'green', 'purple', 'black', 'brown'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedTheme(color)}
                      className={`w-8 h-8 rounded-full border-2 ${selectedTheme === color ? 'ring-2 ring-offset-2 ring-amber-600' : 'border-transparent'} bg-${color === 'maroon' ? 'red-900' : color === 'red' ? 'red-600' : color === 'blue' ? 'blue-600' : color === 'green' ? 'green-600' : color === 'purple' ? 'purple-600' : color === 'black' ? 'black' : 'amber-900'}`}
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer border-t pt-4">
                <div>
                  <span className="text-sm font-medium block">Dark mode</span>
                  <span className="text-xs text-gray-500">Switch the whole app to a dark background.</span>
                </div>
                <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-1">Receipt header text</label>
                <input 
                  type="text" 
                  value={receiptHeader} 
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Receipts & Printing */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Receipts & printing</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Auto-print receipt after checkout</span>
                <input type="checkbox" checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-1">Receipt/printer paper width</label>
                <select 
                  value={paperWidth} 
                  onChange={(e) => setPaperWidth(e.target.value)}
                  className="w-full max-w-md p-2 border rounded-md text-sm bg-transparent"
                >
                  <option value="58mm (small thermal printer)">58mm (small thermal printer)</option>
                  <option value="80mm (large thermal printer)">80mm (large thermal printer)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Till Behavior */}
          <div className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Till behavior</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Require your PIN to void a sale</span>
                <input type="checkbox" checked={pinToVoid} onChange={(e) => setPinToVoid(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>
              <label className="flex items-center justify-between cursor-pointer border-t pt-3">
                <span className="text-sm font-medium">Require your PIN to apply a discount</span>
                <input type="checkbox" checked={pinToDiscount} onChange={(e) => setPinToDiscount(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>
              <label className="flex items-center justify-between cursor-pointer border-t pt-3">
                <span className="text-sm font-medium">Allow selling below zero stock (oversell)</span>
                <input type="checkbox" checked={allowOversell} onChange={(e) => setAllowOversell(e.target.checked)} className="w-4 h-4 accent-amber-600" />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-md shadow-sm transition-colors"
            >
              Save settings
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
