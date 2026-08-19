'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Lacianda Wines and Spirits');
  const [kraPin, setKraPin] = useState('P051234567X');
  const [tillNumber, setTillNumber] = useState('543210');
  const [paybillNumber, setPaybillNumber] = useState('888999');
  const [vatRate, setVatRate] = useState('16');
  const [levyRate, setLevyRate] = useState('2.5');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for shopping with us! Alcohol is not for sale to persons under 18.');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('lacianda_pos_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setStoreName(parsed.storeName || storeName);
      setKraPin(parsed.kraPin || kraPin);
      setTillNumber(parsed.tillNumber || tillNumber);
      setPaybillNumber(parsed.paybillNumber || paybillNumber);
      setVatRate(parsed.vatRate || vatRate);
      setLevyRate(parsed.levyRate || levyRate);
      setReceiptFooter(parsed.receiptFooter || receiptFooter);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = { storeName, kraPin, tillNumber, paybillNumber, vatRate, levyRate, receiptFooter };
    localStorage.setItem('lacianda_pos_settings', JSON.stringify(settings));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all inventory and sales data? This cannot be undone.')) {
      localStorage.removeItem('lacianda_inventory');
      localStorage.removeItem('lacianda_pos_sales');
      alert('Local POS database cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-xl font-bold mb-6">POS Settings</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Profile */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Store Profile & Tax Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">KRA PIN</label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">M-Pesa Till Number</label>
                <input
                  type="text"
                  value={tillNumber}
                  onChange={(e) => setTillNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">M-Pesa Paybill Number</label>
                <input
                  type="text"
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
            </div>
          </div>

          {/* Tax & Levy Config */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Taxes & Levies Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catering Levy Rate (%)</label>
                <input
                  type="number"
                  value={levyRate}
                  onChange={(e) => setLevyRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
              </div>
            </div>
          </div>

          {/* Receipt Customization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Receipt Settings</h2>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Receipt Footer Message</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Reset POS Local Database
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b] transition-colors"
            >
              Save settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
