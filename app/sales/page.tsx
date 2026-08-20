'use client';

import { useState, useEffect } from 'react';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  useEffect(() => {
    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }
  }, []);

  const filteredSales = sales.filter((sale) =>
    sale.id.toLowerCase().includes(search.toLowerCase()) ||
    sale.tenderType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-gray-50 p-6 overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales History Ledger</h1>
          <p className="text-xs text-gray-500">Review completed orders, receipt records, and transaction logs.</p>
        </div>
        <div className="w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID or Mode..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#4a2e2b]"
          />
        </div>
      </div>

      {/* Sales Table Container */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Tender Mode</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{sale.id}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(sale.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sale.tenderType === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sale.tenderType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#4a2e2b]">KES {sale.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                      >
                        View Items
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Transaction Details</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedSale.id} • {new Date(selectedSale.date).toLocaleString()}</p>
            
            <div className="bg-gray-50 p-3 rounded-lg text-left text-xs space-y-2 mb-4 border border-gray-100 max-h-48 overflow-y-auto">
              <div className="font-semibold text-gray-700 border-b pb-1">Purchased Items:</div>
              {selectedSale.items.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span>{i.name} (x{i.qty})</span>
                  <span>KES {(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tender Type:</span>
                <span className="font-semibold text-gray-800">{selectedSale.tenderType}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900">
                <span>Total Amount:</span>
                <span className="text-[#4a2e2b]">KES {selectedSale.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full py-2.5 bg-[#4a2e2b] text-white font-medium rounded-lg hover:bg-[#3b2422] text-sm"
            >
              Close Ledger View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
