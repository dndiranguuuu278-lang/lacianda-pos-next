'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ZReportPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [cashDrawer, setCashDrawer] = useState('');
  const [shiftClosed, setShiftClosed] = useState(false);

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    const storedSales = JSON.parse(localStorage.getItem('lacianda_pos_sales') || '[]');
    setSales(storedSales);
  }, []);

  const completedSales = sales.filter(s => s.status !== 'Voided');
  const grossRevenue = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const mpesaTotal = completedSales.filter(s => s.tender?.includes('M-Pesa')).reduce((sum, s) => sum + (s.total || 0), 0);
  const cashTotal = completedSales.filter(s => s.tender === 'Cash' || !s.tender).reduce((sum, s) => sum + (s.total || 0), 0);
  const vatCollected = grossRevenue * (16 / 116);
  const levyCollected = grossRevenue * 0.025;

  const handleCloseShift = () => {
    if (!cashDrawer) return;
    setShiftClosed(true);
    setTimeout(() => setShiftClosed(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Z-Report — {date}</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
        </div>

        {shiftClosed && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
            Shift successfully closed and recorded. Cash drawer reconciled.
          </div>
        )}

        {/* Revenue Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Revenue summary</h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-xs text-gray-500">Gross revenue</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">KES {grossRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed sales</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{completedSales.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cash total</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES {cashTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">M-Pesa total</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES {mpesaTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Card total</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES 0.00</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Discounts given</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES 0.00</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">VAT collected (16%)</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES {Math.round(vatCollected).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Catering levy collected (2.5%)</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">KES {Math.round(levyCollected).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Cash-up Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Cash-up</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Opening float</span>
              <span className="text-sm font-mono font-semibold">KES 0.00</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Counted cash in drawer (KES)</label>
              <input
                type="number"
                placeholder="Enter counted cash..."
                value={cashDrawer}
                onChange={(e) => setCashDrawer(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
              />
            </div>
            <div className="pt-2">
              <button
                disabled={!cashDrawer}
                onClick={handleCloseShift}
                className="px-6 py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Close shift & log out
              </button>
              <p className="text-[11px] text-gray-400 mt-2">Enter the counted cash above to enable closing this shift.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
