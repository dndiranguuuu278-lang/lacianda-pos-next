'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function EtimsQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [payloadModal, setPayloadModal] = useState<any | null>(null);

  useEffect(() => {
    const storedSales = JSON.parse(localStorage.getItem('lacianda_pos_sales') || '[]');
    const mappedQueue = storedSales.map((sale: any) => {
      const taxable = sale.total ? Math.round(sale.total / 1.16) : 0;
      const vat = sale.total ? Math.round(sale.total - taxable) : 0;
      return {
        id: sale.id || 'LWS-20260816-0001',
        date: new Date(sale.timestamp || Date.now()).toLocaleString(),
        taxable,
        vat,
        total: sale.total || 0,
        items: sale.items || [],
        status: sale.etimsStatus || 'Staged',
      };
    });
    setQueue(mappedQueue);
  }, []);

  const handleMarkSubmitted = (id: string) => {
    const updated = queue.map(item => item.id === id ? { ...item, status: 'Submitted' } : item);
    setQueue(updated);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `etims_queue_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">eTIMS queue</h1>
            <p className="text-xs text-gray-500 mt-1">
              Sales below have already been classified by tax type per item. Submit them through your approved eTIMS device/software, then mark them submitted here to keep the queue clean.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b text-xs uppercase text-gray-600">
              <tr>
                <th className="p-4">Receipt</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Taxable</th>
                <th className="p-4 text-right">VAT</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No sales in eTIMS queue.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-medium">{item.id}</td>
                    <td className="p-4 text-gray-600">{item.date}</td>
                    <td className="p-4 text-right font-mono">KES {item.taxable.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono">KES {item.vat.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono font-semibold">KES {item.total.toLocaleString()}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setPayloadModal(item)}
                        className="text-xs text-[#78350f] font-medium hover:underline"
                      >
                        View payload
                      </button>
                      {item.status !== 'Submitted' ? (
                        <button
                          onClick={() => handleMarkSubmitted(item.id)}
                          className="px-3 py-1 bg-[#78350f] text-white rounded text-xs font-semibold hover:bg-[#60280b] transition-colors"
                        >
                          Mark submitted
                        </button>
                      ) : (
                        <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded">Submitted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Payload Modal */}
      {payloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2">eTIMS Payload — {payloadModal.id}</h3>
            <p className="text-xs text-gray-500 mb-4">{payloadModal.date}</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs max-h-60 overflow-y-auto mb-4">
              <pre>{JSON.stringify(payloadModal, null, 2)}</pre>
            </div>
            <button
              onClick={() => setPayloadModal(null)}
              className="w-full py-2 bg-[#78350f] text-white rounded-md text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
