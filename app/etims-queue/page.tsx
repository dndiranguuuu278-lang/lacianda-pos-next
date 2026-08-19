'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface EtimsInvoice {
  id: string;
  timestamp: string;
  kraPin: string;
  items: Array<{ name: string; price: number; qty: number; taxType: string }>;
  subtotal: number;
  vat: number;
  levy: number;
  total: number;
  status: 'Staged' | 'Submitted';
}

export default function EtimsQueuePage() {
  const [invoices, setInvoices] = useState<EtimsInvoice[]>([]);
  const [kraPin, setKraPin] = useState('P0XXXXXXXXX');

  useEffect(() => {
    // Load settings for KRA PIN
    const settings = JSON.parse(localStorage.getItem('lacianda_pos_settings') || '{}');
    if (settings.etims?.kraPin) {
      setKraPin(settings.etims.kraPin);
    }

    // Load sales and map them into eTIMS staged format
    const rawSales = JSON.parse(localStorage.getItem('lacianda_pos_sales') || '[]');
    const staged: EtimsInvoice[] = rawSales.map((sale: any, idx: number) => {
      const subtotal = sale.total ? sale.total / 1.185 : 0; // Back-calculating approximate tax split if inclusive
      const vat = subtotal * 0.16;
      const levy = subtotal * 0.025;
      return {
        id: sale.id || `INV-${2026}-${1000 + idx}`,
        timestamp: sale.timestamp || new Date().toISOString(),
        kraPin: settings.etims?.kraPin || 'P0XXXXXXXXX',
        items: sale.items || [],
        subtotal: Math.round(subtotal),
        vat: Math.round(vat),
        levy: Math.round(levy),
        total: sale.total || 0,
        status: sale.etimsStatus || 'Staged',
      };
    });
    setInvoices(staged);
  }, []);

  const handleExportBatch = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `etims_queue_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">KRA eTIMS Staging Queue</h1>
            <p className="text-xs text-gray-500 mt-1">Active KRA PIN: <span className="font-mono font-semibold">{kraPin}</span></p>
          </div>
          <button 
            onClick={handleExportBatch}
            className="px-4 py-2 bg-amber-800 text-white rounded-md text-sm font-medium hover:bg-amber-900 transition-colors"
          >
            Export Batch for Middleware
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b text-xs uppercase text-gray-600">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Time</th>
                <th className="p-4">Items Count</th>
                <th className="p-4 text-right">VAT (16%)</th>
                <th className="p-4 text-right">Levy (2.5%)</th>
                <th className="p-4 text-right">Total (KES)</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No sales recorded yet to stage for eTIMS.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-medium">{inv.id}</td>
                    <td className="p-4 text-gray-600">{new Date(inv.timestamp).toLocaleString()}</td>
                    <td className="p-4">{inv.items.length} items</td>
                    <td className="p-4 text-right font-mono">KES {inv.vat.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono">KES {inv.levy.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono font-semibold">KES {inv.total.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
