'use client';

import { GrapeClusterIcon } from './icons';
import WaxSeal from './wax-seal';
import type { ReceiptLineItem, ReceiptTicketProps } from '@/types';
export type { ReceiptLineItem, ReceiptTicketProps };

function formatKES(n: number): string {
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReceiptTicket({
  storeName = 'Lacianda Wines & Spirits',
  storeBranch = 'Main Branch · Valley Arcade, Nairobi',
  kraPin = 'P051982734Z',
  receiptNumber,
  date,
  cashierName = 'dennis',
  items,
  taxableAmount,
  taxAmount,
  totalAmount,
  tenderType,
  amountPaid,
  change,
  mpesaRef,
  isPaid = true,
  isVoided = false,
  className = '',
  showPrintButton = true,
  onClose
}: ReceiptTicketProps) {
  const formattedDate = date
    ? new Date(date).toLocaleString('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

  const calculatedTaxable = taxableAmount ?? Math.round(totalAmount / 1.16);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`relative max-w-sm mx-auto select-none ${className}`}>
      {/* Decorative Outer Border */}
      <div className="rounded-xl border border-primary/20 bg-card p-1 shadow-lg">
        <div className="relative rounded-lg border border-primary/30 bg-paper p-6 text-foreground">
          
          {/* Wax Seal Overlay */}
          {isVoided ? (
            <div className="absolute -top-3 -right-2 rotate-12 z-10">
              <WaxSeal label="VOIDED" variant="void" />
            </div>
          ) : isPaid ? (
            <div className="absolute -top-3 -right-2 rotate-12 z-10">
              <WaxSeal label="PAID" variant="active" />
            </div>
          ) : null}

          {/* Header Brand */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <GrapeClusterIcon className="h-5 w-5" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-primary">
                {storeName}
              </h3>
              <GrapeClusterIcon className="h-5 w-5 -scale-x-100" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{storeBranch}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">KRA PIN: {kraPin}</p>
          </div>

          {/* Metadata Row */}
          <div className="my-3 border-t border-dashed border-primary/20 pt-2 text-[11px] text-muted-foreground flex justify-between">
            <div className="flex flex-col">
              <span className="font-mono font-medium text-foreground">{receiptNumber}</span>
              <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-muted-foreground">Cashier</span>
              <span className="font-medium text-foreground uppercase text-[10px]">{cashierName}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-primary/25 my-2" />

          {/* Items Table */}
          <div className="space-y-2 py-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <p className="font-medium text-foreground leading-snug">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {item.quantity} × {formatKES(item.price ?? Math.round(item.lineTotal / item.quantity))}
                  </p>
                </div>
                <span className="font-semibold text-foreground tabular-nums shrink-0 pt-0.5">
                  {formatKES(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="my-3 border-t border-dashed border-primary/25 pt-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Taxable (16% Base)</span>
              <span className="tabular-nums font-mono">{formatKES(calculatedTaxable)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (16%)</span>
              <span className="tabular-nums font-mono">{formatKES(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-primary/20 pt-2 text-base font-extrabold text-primary">
              <span>TOTAL DUE</span>
              <span className="tabular-nums font-mono">{formatKES(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mt-3 rounded bg-gray-100/70 p-2 text-xs border border-gray-200/60 space-y-1">
            <div className="flex justify-between font-medium text-gray-700">
              <span>Payment Tender</span>
              <span className="font-semibold text-gray-900">{tenderType}</span>
            </div>
            {mpesaRef && (
              <div className="flex justify-between text-gray-600 font-mono text-[11px]">
                <span>M-Pesa Ref</span>
                <span className="font-semibold text-emerald-800">{mpesaRef}</span>
              </div>
            )}
            {amountPaid !== undefined && (
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Amount Tendered</span>
                <span className="tabular-nums">{formatKES(amountPaid)}</span>
              </div>
            )}
            {change !== undefined && change > 0 && (
              <div className="flex justify-between text-gray-800 font-semibold text-[11px] pt-1 border-t border-gray-200">
                <span>Change Due</span>
                <span className="tabular-nums text-emerald-700">{formatKES(change)}</span>
              </div>
            )}
          </div>

          {/* KRA eTIMS Fiscal Notice */}
          <div className="mt-4 pt-3 border-t border-dashed border-gray-300 text-center flex flex-col items-center">
            <div className="h-10 w-24 bg-gray-200/80 rounded border border-gray-300 flex items-center justify-center font-mono text-[9px] text-gray-500 tracking-wider">
              ||| |||| || |||
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-1">eTIMS CU-INV: 2026-LWS-{receiptNumber.slice(-4)}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Verified &amp; Fiscalized · Thank you for your patronage</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      {showPrintButton && (
        <div className="mt-3 flex gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-10 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-wine-800 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
