'use client';

import { useState, useEffect } from 'react';
import ReceiptTicket from '@/components/receipt-ticket';
import type { SaleItem, SaleRecord, TenderFilter } from '@/types';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [search, setSearch] = useState('');
  const [tenderFilter, setTenderFilter] = useState('All');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  const getDefaultDemoSales = (): SaleRecord[] => [
    {
      id: 'LWS-20260816-0005',
      receiptNumber: 'LWS-20260816-0005',
      date: '2026-08-16T22:38:10.000Z',
      items: [
        { id: '1', name: 'Kenya Cane 750ml', price: 850, quantity: 1, lineTotal: 850 },
        { id: '2', name: 'Guinness Extra Stout 330ml', price: 230, quantity: 2, lineTotal: 460 },
        { id: '3', name: 'Red Bull Energy Drink 250ml', price: 250, quantity: 1, lineTotal: 250 }
      ],
      total: 1560,
      taxable: 1344.83,
      vat: 215.17,
      tenderType: 'M-Pesa Till',
      mpesaRef: 'QK91823101',
      isVoided: false
    },
    {
      id: 'LWS-20260816-0004',
      receiptNumber: 'LWS-20260816-0004',
      date: '2026-08-16T21:55:51.000Z',
      items: [
        { id: '1', name: 'Gilbeys Special Dry Gin 750ml', price: 1350, quantity: 1, lineTotal: 1350 },
        { id: '2', name: 'Dasani Sparkling Water Lemon 500ml', price: 100, quantity: 1, lineTotal: 100 }
      ],
      total: 1450,
      taxable: 1250.00,
      vat: 200.00,
      tenderType: 'Cash',
      amountPaid: 2000,
      change: 550,
      isVoided: false
    },
    {
      id: 'LWS-20260816-0003',
      receiptNumber: 'LWS-20260816-0003',
      date: '2026-08-16T21:54:24.000Z',
      items: [
        { id: '1', name: 'The Botanist Islay Dry Gin 750ml', price: 4500, quantity: 1, lineTotal: 4500 }
      ],
      total: 4500,
      taxable: 3879.31,
      vat: 620.69,
      tenderType: 'M-Pesa Paybill',
      mpesaRef: 'QK89127814',
      isVoided: false
    },
    {
      id: 'LWS-20260816-0002',
      receiptNumber: 'LWS-20260816-0002',
      date: '2026-08-16T19:30:11.000Z',
      items: [
        { id: '1', name: 'Tusker Lager 500ml', price: 220, quantity: 4, lineTotal: 880 },
        { id: '2', name: 'Captain Morgan Gold 750ml', price: 1450, quantity: 1, lineTotal: 1450 }
      ],
      total: 2330,
      taxable: 2008.62,
      vat: 321.38,
      tenderType: 'Cash',
      amountPaid: 2500,
      change: 170,
      isVoided: false
    },
    {
      id: 'LWS-20260816-0001',
      receiptNumber: 'LWS-20260816-0001',
      date: '2026-08-16T18:15:00.000Z',
      items: [
        { id: '1', name: 'Martini Extra Dry 1L', price: 1950, quantity: 1, lineTotal: 1950 }
      ],
      total: 1950,
      taxable: 1681.03,
      vat: 268.97,
      tenderType: 'Card',
      isVoided: true
    }
  ];

  useEffect(() => {
    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      try {
        setSales(JSON.parse(storedSales));
      } catch {
        setSales(getDefaultDemoSales());
      }
    } else {
      const demo = getDefaultDemoSales();
      setSales(demo);
      localStorage.setItem('lacianda_sales', JSON.stringify(demo));
    }
  }, []);

  const handleVoidSale = (id: string) => {
    if (!window.confirm('Are you sure you want to void this transaction? This will be flagged in KRA eTIMS queue.')) {
      return;
    }
    const updated = sales.map((s) => (s.id === id ? { ...s, isVoided: true } : s));
    setSales(updated);
    localStorage.setItem('lacianda_sales', JSON.stringify(updated));
    if (selectedSale?.id === id) {
      setSelectedSale({ ...selectedSale, isVoided: true });
    }
  };

  const activeSales = sales.filter((s) => !s.isVoided);
  const totalRevenue = activeSales.reduce((acc, s) => acc + s.total, 0);
  const cashTotal = activeSales
    .filter((s) => s.tenderType === 'Cash')
    .reduce((acc, s) => acc + s.total, 0);
  const mpesaTotal = activeSales
    .filter((s) => s.tenderType.startsWith('M-Pesa'))
    .reduce((acc, s) => acc + s.total, 0);
  const cardTotal = activeSales
    .filter((s) => s.tenderType === 'Card')
    .reduce((acc, s) => acc + s.total, 0);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      (sale.receiptNumber && sale.receiptNumber.toLowerCase().includes(search.toLowerCase())) ||
      (sale.mpesaRef && sale.mpesaRef.toLowerCase().includes(search.toLowerCase())) ||
      sale.items.some((it) => it.name.toLowerCase().includes(search.toLowerCase()));

    const matchesTender =
      tenderFilter === 'All' ||
      (tenderFilter === 'M-Pesa' && sale.tenderType.startsWith('M-Pesa')) ||
      sale.tenderType === tenderFilter;

    return matchesSearch && matchesTender;
  });

  const formatKES = (val: number) =>
    `KES ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Sales History &amp; Audit Log</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {sales.length} records
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit trail of completed till transactions, tender receipts, and KRA eTIMS submissions
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Export Daily Journal</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gross Sales</span>
          <div className="text-lg sm:text-xl font-extrabold text-primary font-mono mt-1">
            {formatKES(totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
            {activeSales.length} Completed
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">M-Pesa Tender</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatKES(mpesaTotal)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Till &amp; Paybill</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cash in Drawer</span>
          <div className="text-lg sm:text-xl font-extrabold text-blue-700 font-mono mt-1">
            {formatKES(cashTotal)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Reconciled Float</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">PDQ Cards &amp; Void</span>
          <div className="text-lg sm:text-xl font-extrabold text-purple-700 font-mono mt-1">
            {formatKES(cardTotal)}
          </div>
          <span className="text-[10px] text-red-600 font-medium mt-0.5 block">
            {sales.filter((s) => s.isVoided).length} Voided
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-2xs mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, M-Pesa ref, or item..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          />
        </div>

        {/* Tender Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {['All', 'M-Pesa', 'Cash', 'Card'].map((tender) => {
            const isSelected = tenderFilter === tender;
            return (
              <button
                key={tender}
                type="button"
                onClick={() => setTenderFilter(tender)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tender}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Tender Method</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const formattedDate = new Date(sale.date).toLocaleString('en-KE', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  });

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        sale.isVoided ? 'bg-red-50/30 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {sale.receiptNumber || sale.id}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="truncate text-gray-800">
                          {sale.items
                            .map((it) => `${it.quantity ?? it.qty ?? 1}x ${it.name}`)
                            .join(', ')}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            sale.tenderType.startsWith('M-Pesa')
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.tenderType === 'Cash'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {sale.tenderType}
                        </span>
                        {sale.mpesaRef && (
                          <span className="block font-mono text-[10px] text-gray-400 mt-0.5">
                            {sale.mpesaRef}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-primary whitespace-nowrap">
                        {formatKES(sale.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {sale.isVoided ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            VOIDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            COMPLETED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSale(sale)}
                            className="px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                          >
                            Receipt
                          </button>
                          {!sale.isVoided && (
                            <button
                              type="button"
                              onClick={() => handleVoidSale(sale.id)}
                              className="px-2 py-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 font-semibold transition-colors"
                              title="Void sale"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt inspection modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-md w-full my-auto border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-gray-900">Receipt Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>

            <ReceiptTicket
              storeName="Lacianda Wines & Spirits"
              receiptNumber={selectedSale.receiptNumber || selectedSale.id}
              date={selectedSale.date}
              cashierName="dennis"
              items={selectedSale.items.map((it) => ({
                id: it.id,
                name: it.name,
                quantity: it.quantity ?? it.qty ?? 1,
                price: it.price,
                lineTotal: it.lineTotal ?? it.price * (it.quantity ?? it.qty ?? 1)
              }))}
              taxAmount={selectedSale.vat || Math.round(selectedSale.total - selectedSale.total / 1.16)}
              totalAmount={selectedSale.total}
              tenderType={selectedSale.tenderType}
              amountPaid={selectedSale.amountPaid}
              change={selectedSale.change}
              mpesaRef={selectedSale.mpesaRef}
              isPaid={true}
              isVoided={selectedSale.isVoided}
              onClose={() => setSelectedSale(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
