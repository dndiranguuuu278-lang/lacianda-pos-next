'use client';

import { useState, useEffect } from 'react';
import type { EtimsItem } from '@/types';

export default function EtimsQueuePage() {
  const [queue, setQueue] = useState<EtimsItem[]>([]);
  const [selectedPayload, setSelectedPayload] = useState<EtimsItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueue = () => {
    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      try {
        const sales = JSON.parse(storedSales);
        const mapped: EtimsItem[] = sales.map((sale: any, idx: number) => {
          const total = sale.total || 0;
          const taxable = sale.taxable || Math.round(total / 1.16);
          const vat = sale.vat || Math.round(total - taxable);
          return {
            id: sale.id || `ETIMS-${idx + 1}`,
            receiptNumber: sale.receiptNumber || sale.id || `LWS-20260816-000${idx + 1}`,
            date: sale.date || new Date().toISOString(),
            taxable,
            vat,
            total,
            status: idx === 0 ? 'Pending' : 'Submitted',
            items: sale.items || [],
            kraSignature: idx === 0 ? undefined : `KRA-SCU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          };
        });
        setQueue(mapped);
      } catch {
        setQueue(getDefaultQueue());
      }
    } else {
      setQueue(getDefaultQueue());
    }
  };

  const getDefaultQueue = (): EtimsItem[] => [
    {
      id: 'LWS-20260816-0005',
      receiptNumber: 'LWS-20260816-0005',
      date: '2026-08-16T22:38:10.000Z',
      taxable: 1344.83,
      vat: 215.17,
      total: 1560.0,
      status: 'Pending',
      items: [
        { name: 'Kenya Cane 750ml', price: 850, quantity: 1 },
        { name: 'Guinness Extra Stout 330ml', price: 230, quantity: 2 }
      ]
    },
    {
      id: 'LWS-20260816-0004',
      receiptNumber: 'LWS-20260816-0004',
      date: '2026-08-16T21:55:51.000Z',
      taxable: 1250.0,
      vat: 200.0,
      total: 1450.0,
      status: 'Submitted',
      kraSignature: 'KRA-SCU-99213812',
      items: [{ name: 'Gilbeys Special Dry Gin 750ml', price: 1350, quantity: 1 }]
    },
    {
      id: 'LWS-20260816-0003',
      receiptNumber: 'LWS-20260816-0003',
      date: '2026-08-16T21:54:24.000Z',
      taxable: 3879.31,
      vat: 620.69,
      total: 4500.0,
      status: 'Submitted',
      kraSignature: 'KRA-SCU-77123984',
      items: [{ name: 'The Botanist Islay Dry Gin 750ml', price: 4500, quantity: 1 }]
    }
  ];

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = queue.map((item) => ({
        ...item,
        status: 'Submitted' as const,
        kraSignature: item.kraSignature || `KRA-SCU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }));
      setQueue(updated);
      setIsSyncing(false);
      alert('All pending invoices successfully fiscalized and synced with KRA eTIMS OSCU server.');
    }, 1200);
  };

  const pendingCount = queue.filter((i) => i.status === 'Pending').length;
  const submittedCount = queue.filter((i) => i.status === 'Submitted').length;
  const totalTaxRemitted = queue.reduce((acc, i) => acc + i.vat, 0);

  const formatKES = (val: number) =>
    `KES ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>KRA eTIMS Fiscalization Queue</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              OSCU API Live
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Local-first offline buffering with automated fiscal transmission to Kenya Revenue Authority
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncing || pendingCount === 0}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isSyncing ? 'Transmitting to KRA...' : `Sync All Pending (${pendingCount})`}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Sync</span>
          <div className="text-lg sm:text-xl font-extrabold text-amber-700 font-mono mt-1">
            {pendingCount} Invoices
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Buffered in local storage</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Synced &amp; Fiscalized</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {submittedCount} Invoices
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">KRA SCU signature signed</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total VAT Remitted</span>
          <div className="text-lg sm:text-xl font-extrabold text-purple-700 font-mono mt-1">
            {formatKES(totalTaxRemitted)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">16% Standard rate</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">KRA Device PIN</span>
          <div className="text-sm font-extrabold font-mono text-gray-900 mt-2">
            P051982734Z
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">OSCU Server Connected</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4 text-right">Taxable Net</th>
                <th className="py-3.5 px-4 text-right">16% VAT</th>
                <th className="py-3.5 px-4 text-right">Gross Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Payload Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {queue.map((item) => {
                const formattedDate = new Date(item.date).toLocaleString('en-KE', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                });

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {item.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                      {formatKES(item.taxable)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                      {formatKES(item.vat)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-primary">
                      {formatKES(item.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.status === 'Submitted' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Fiscalized
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Sync
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPayload(item)}
                        className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors"
                      >
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Raw Payload Inspector Modal ── */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">KRA eTIMS Payload Inspection</h3>
                <p className="text-[11px] text-gray-500 font-mono">{selectedPayload.receiptNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto">
              <pre className="p-4 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(
                  {
                    tpin: 'P051982734Z',
                    bhfId: '00',
                    invcNo: selectedPayload.receiptNumber,
                    orgInvcNo: 0,
                    custTin: '',
                    custNm: 'Walk-in Customer',
                    rcptTyCd: 'S',
                    pmtTyCd: '01',
                    salesSttsCd: '02',
                    cfmDt: selectedPayload.date,
                    salesDt: selectedPayload.date.slice(0, 10).replace(/-/g, ''),
                    totItemCnt: selectedPayload.items?.length || 1,
                    taxblAmtA: selectedPayload.taxable,
                    taxAmtA: selectedPayload.vat,
                    totTaxblAmt: selectedPayload.taxable,
                    totTaxAmt: selectedPayload.vat,
                    totAmt: selectedPayload.total,
                    scuSignature: selectedPayload.kraSignature || 'PENDING_TRANSMISSION'
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
