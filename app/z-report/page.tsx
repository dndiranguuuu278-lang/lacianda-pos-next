'use client';

import { useState, useEffect } from 'react';
import { GrapeClusterIcon } from '@/components/icons';
import type { SaleRecord } from '@/types';

export default function ZReportPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [openingFloat, setOpeningFloat] = useState('2000');
  const [countedCash, setCountedCash] = useState('6770');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );

    const storedSales = localStorage.getItem('lacianda_sales');
    if (storedSales) {
      try {
        setSales(JSON.parse(storedSales));
      } catch {
        setSales([]);
      }
    }
  }, []);

  const activeSales = sales.filter((s) => !s.isVoided);
  const voidedCount = sales.filter((s) => s.isVoided).length;

  const grossRevenue = activeSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalTaxable = Math.round(grossRevenue / 1.16);
  const totalVat = Math.round(grossRevenue - totalTaxable);
  const cateringLevy = Math.round(grossRevenue * 0.02);

  const cashSalesTotal = activeSales
    .filter((s) => s.tenderType === 'Cash')
    .reduce((acc, s) => acc + s.total, 0);

  const mpesaSalesTotal = activeSales
    .filter((s) => s.tenderType.startsWith('M-Pesa'))
    .reduce((acc, s) => acc + s.total, 0);

  const cardSalesTotal = activeSales
    .filter((s) => s.tenderType === 'Card')
    .reduce((acc, s) => acc + s.total, 0);

  const parsedFloat = parseFloat(openingFloat) || 0;
  const parsedCounted = parseFloat(countedCash) || 0;
  const expectedCashInDrawer = parsedFloat + cashSalesTotal;
  const cashDiscrepancy = parsedCounted - expectedCashInDrawer;

  const formatKES = (val: number) =>
    `KES ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Daily Z-Report &amp; Financial Closeout</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Fiscal day closure: {dateStr} · Till #01 (dennis)
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="self-start sm:self-auto px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-wine-800 active:scale-98 transition-all shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Thermal Z-Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gross Daily Turnover</span>
          <div className="text-lg sm:text-xl font-extrabold text-primary font-mono mt-1">
            {formatKES(grossRevenue)}
          </div>
          <span className="text-[10px] text-gray-500 font-medium mt-0.5 block">
            {activeSales.length} Total transactions
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">M-Pesa Receipts</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatKES(mpesaSalesTotal)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            Till &amp; Paybill settlements
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Cash Register Sales</span>
          <div className="text-lg sm:text-xl font-extrabold text-blue-700 font-mono mt-1">
            {formatKES(cashSalesTotal)}
          </div>
          <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
            Physical cash collected
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">KRA 16% VAT Accrued</span>
          <div className="text-lg sm:text-xl font-extrabold text-purple-700 font-mono mt-1">
            {formatKES(totalVat)}
          </div>
          <span className="text-[10px] text-purple-600 font-medium mt-0.5 block">
            Taxable base: {formatKES(totalTaxable)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cash Reconciliation & Revenue Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cash Float Reconciliation Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">Physical Cash Drawer Balancing</h2>
              <p className="text-xs text-gray-500">
                Reconcile physical counted cash in register with opening float and recorded cash receipts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Morning Opening Float (KES)
                </label>
                <input
                  type="number"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Evening Counted Cash in Till (KES)
                </label>
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Reconciliation Comparison Result */}
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Expected Drawer Total (Float + Cash Sales):</span>
                <span className="font-mono font-bold">{formatKES(expectedCashInDrawer)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Actual Counted Cash:</span>
                <span className="font-mono font-bold">{formatKES(parsedCounted)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold">
                <span>Discrepancy / Variance:</span>
                <span
                  className={`font-mono px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    cashDiscrepancy === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : cashDiscrepancy > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cashDiscrepancy === 0
                    ? 'Exact Match (KES 0.00)'
                    : cashDiscrepancy > 0
                    ? `Over by ${formatKES(cashDiscrepancy)}`
                    : `Short by ${formatKES(Math.abs(cashDiscrepancy))}`}
                </span>
              </div>
            </div>
          </div>

          {/* Tender Type Breakdown */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Tender Settlement Breakdown</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-800">M-Pesa (Till / Paybill)</span>
                <span className="font-mono font-bold text-emerald-800">{formatKES(mpesaSalesTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-800">Physical Cash</span>
                <span className="font-mono font-bold text-blue-800">{formatKES(cashSalesTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-800">PDQ Debit/Credit Cards</span>
                <span className="font-mono font-bold text-purple-800">{formatKES(cardSalesTotal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                <span className="font-medium text-red-800">Voided Transactions ({voidedCount})</span>
                <span className="font-mono font-bold text-red-700">Excluded from totals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Thermal Z-Report Receipt View */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-card p-1 shadow-md">
            <div className="rounded-xl border border-primary/25 bg-paper p-5 text-gray-800 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-primary/20">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <GrapeClusterIcon className="h-4 w-4" />
                  <span className="font-bold tracking-wider uppercase text-sm">Lacianda Wines</span>
                </div>
                <p className="text-[10px] text-gray-500">OFFICIAL FISCAL Z-REPORT</p>
                <p className="text-[10px] text-gray-500">{dateStr}</p>
                <p className="text-[9px] text-gray-400">Till: 01 · Cashier: dennis</p>
              </div>

              <div className="py-3 space-y-1.5 border-b border-dashed border-primary/20 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span className="font-bold text-gray-900">{formatKES(grossRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Net:</span>
                  <span>{formatKES(totalTaxable)}</span>
                </div>
                <div className="flex justify-between">
                  <span>16% VAT:</span>
                  <span>{formatKES(totalVat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catering Levy (2%):</span>
                  <span>{formatKES(cateringLevy)}</span>
                </div>
              </div>

              <div className="py-3 space-y-1.5 border-b border-dashed border-primary/20 text-[11px]">
                <div className="flex justify-between">
                  <span>M-Pesa Settlements:</span>
                  <span className="text-emerald-800 font-bold">{formatKES(mpesaSalesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Collections:</span>
                  <span className="text-blue-800 font-bold">{formatKES(cashSalesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span>{formatKES(parsedFloat)}</span>
                </div>
              </div>

              <div className="pt-3 text-center text-[10px] text-gray-400 space-y-0.5">
                <p>KRA eTIMS FISCAL DAY CLOSED</p>
                <p>Z-REPORT NO: Z-2026-0816-01</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
