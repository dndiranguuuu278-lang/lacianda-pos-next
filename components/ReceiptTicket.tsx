import { GrapeClusterIcon } from './icons';
import WaxSeal from './WaxSeal';

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface ReceiptTicketProps {
  storeName: string;
  receiptNumber: string;
  items: ReceiptLineItem[];
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa';
  mpesaCode?: string | null;
  paid?: boolean;
  className?: string;
}

function formatKES(n: number): string {
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

/**
 * The signature receipt layout for this app: a wine-label-styled ticket
 * (nested terracotta border, parchment fill, grape-cluster crest) with a
 * wax-seal "PAID" stamp tilted into the corner — used on the Till checkout
 * confirmation screen and in the Sales History detail modal.
 */
export default function ReceiptTicket({
  storeName,
  receiptNumber,
  items,
  taxAmount,
  totalAmount,
  paymentMethod,
  mpesaCode,
  paid = true,
  className = ''
}: ReceiptTicketProps) {
  return (
    <div className={`relative rounded-lg border border-[#78350f]/25 p-1 ${className}`}>
      <div className="rounded-md border border-[#78350f]/40 bg-[#fdfbf6] p-6">
        {paid && (
          <div className="absolute -top-3 -right-3 rotate-12">
            <WaxSeal label="PAID" variant="active" />
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-[#78350f]">
          <GrapeClusterIcon className="h-5 w-5" />
          <h3 className="text-center text-sm font-semibold tracking-wide">{storeName}</h3>
          <GrapeClusterIcon className="h-5 w-5 -scale-x-100" />
        </div>
        <p className="mt-1 text-center text-xs text-[#6B7280]">{receiptNumber}</p>

        <div className="my-4 border-t border-dashed border-[#78350f]/25" />

        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-700">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium text-gray-900">{formatKES(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-[#78350f]/25" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-[#6B7280]">
            <span>VAT</span>
            <span>{formatKES(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-[#78350f]/20 pt-1.5 text-base font-semibold text-[#78350f]">
            <span>TOTAL</span>
            <span>{formatKES(totalAmount)}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#6B7280]">
          {paymentMethod === 'mpesa' ? `M-Pesa · ${mpesaCode ?? ''}` : 'Paid · Cash'}
        </p>
      </div>
    </div>
  );
}
