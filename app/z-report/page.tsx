'use client';

import { useState, useEffect } from 'react';

export default function ZReportPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }
  }, []);

  // Calculate totals and metrics
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalTransactions = sales.length;

  const cashTotal = sales
    .filter((s) => s.tenderType === 'Cash')
    .reduce((acc, s) => acc + s.total, 0);

  const mpesaTotal = sales
    .filter((s) => s.tenderType === 'M-Pesa')
    .reduce((acc, s) => acc + s.total, 0);

  // Aggregate items sold quantities
  const itemCounts: { [key: string]: { name: string; qty: number; total: number } } = {};
  sales.forEach((sale) => {
    sale.items.forEach((item: any) => {
      if (!itemCounts[item.id]) {
        itemCounts[item.id] = { name: item.name, qty: 0, total: 0 };
      }
      itemCounts[item.id].qty += item.qty;
      itemCounts[item.id].total += item.price * item.qty;
    });
  });

  const aggregatedItems = Object.values(itemCounts);

  const handlePrintReport = () => {
    window.print();
  };

  const handleClearSales = () => {
    if (confirm('Are you sure you want to reset sales history for a new shift?')) {
      localStorage.removeItem('lacianda_sales');
      setSales([]);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-gray-50 p-6 overflow-y-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Z-Report (End of Day Summary)</h1>
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Print Z-Report
          </button>
          <button
            onClick={handleClearSales}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
          >
            Clear Shift Sales
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-[#4a2e2b]">KES {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Transactions</p>
          <p className="text-xl font-bold text-gray-900">{totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">Cash Sales</p>
          <p className="text-xl font-bold text-gray-900">KES {cashTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">M-Pesa Sales</p>
          <p className="text-xl font-bold text-gray-900">KES {mpesaTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Items Sold Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-sm text-gray-800">Products Sold Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/50">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Quantity Sold</th>
                <th className="px-6 py-3 text-right">Total Revenue (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {aggregatedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No sales recorded for this shift yet.
                  </td>
                </tr>
              ) : (
                aggregatedItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.qty} units</td>
                    <td className="px-6 py-4 font-semibold text-right text-[#4a2e2b]">KES {item.total.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
