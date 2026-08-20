'use client';

import { useState, useEffect } from 'react';

export default function EtimsQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    // Load local sales or eTIMS queue items
    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      const sales = JSON.parse(storedSales);
      // Map transactions into eTIMS queue format
      const etimsItems = sales.map((sale: any, idx: number) => ({
        id: `ETIMS-${sale.id}`,
        invoiceNo: sale.id,
        date: sale.date,
        amount: sale.total,
        status: idx % 3 === 0 ? 'Pending' : 'Synced', // Mock status spread
      }));
      setQueue(etimsItems);
    } else {
      setQueue([
        { id: 'ETIMS-TXN-984123', invoiceNo: 'TXN-984123', date: new Date().toISOString(), amount: 4500, status: 'Pending' },
        { id: 'ETIMS-TXN-554102', invoiceNo: 'TXN-554102', date: new Date().toISOString(), amount: 2200, status: 'Synced' },
      ]);
    }
  }, []);

  const handleSyncItem = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Synced' } : item))
    );
  };

  const handleSyncAll = () => {
    setQueue((prev) => prev.map((item) => ({ ...item, status: 'Synced' })));
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-gray-50 p-6 overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">eTIMS Submission Queue</h1>
          <p className="text-xs text-gray-500">KRA electronic tax invoice synchronization and status tracking.</p>
        </div>
        <div>
          <button
            onClick={handleSyncAll}
            className="px-4 py-2 bg-[#4a2e2b] text-white hover:bg-[#3b2422] text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Sync All Pending Invoices
          </button>
        </div>
      </div>

      {/* Queue Table Container */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-3">Queue ID</th>
                <th className="px-6 py-3">Invoice / Ref No.</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Amount (KES)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No items in the eTIMS queue.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 text-xs">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.invoiceNo}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{new Date(item.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-[#4a2e2b]">KES {item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Synced' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'Pending' ? (
                        <button
                          onClick={() => handleSyncItem(item.id)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded transition-colors"
                        >
                          Sync Now
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Verified</span>
                      )}
                    </td>
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
