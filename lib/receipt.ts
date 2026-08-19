// Isomorphic receipt layout generation — runs identically on the server
// (e.g. an emailed/downloaded copy) and in the browser (window.print(), or
// feeding an ESC/POS Bluetooth thermal printer). No DOM or Node-only APIs,
// so it's safe to import from either a route handler or a client component.

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ReceiptData {
  storeName: string;
  receiptNumber: string;
  items: ReceiptItem[];
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa';
  mpesaCode?: string | null;
  etimsCuin?: string | null;
  etimsQrUrl?: string | null;
  createdAt?: string;
}

export function formatKES(n: number): string {
  return `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

// ── HTML layout (browser print / A6 fallback for tills without a Bluetooth printer) ──

export function buildReceiptHtml(data: ReceiptData): string {
  const itemRows = data.items
    .map(
      (it) => `
        <tr>
          <td>${it.quantity} x ${escapeHtml(it.product_name)}</td>
          <td class="right">${formatKES(it.line_total)}</td>
        </tr>`
    )
    .join('');

  const paymentLine =
    data.paymentMethod === 'mpesa'
      ? `M-Pesa · ${escapeHtml(data.mpesaCode || '')}`
      : 'Paid · Cash';

  const etimsLine = data.etimsCuin
    ? `KRA CU Invoice No: ${escapeHtml(data.etimsCuin)}`
    : 'Not fiscalized (eTIMS not configured)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Receipt ${escapeHtml(data.receiptNumber)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  body { font-family: 'Courier New', monospace; width: 72mm; margin: 0 auto; color: #000; font-size: 12px; }
  h1 { font-size: 15px; text-align: center; margin: 0 0 2px; }
  .muted { color: #444; text-align: center; font-size: 10px; margin-bottom: 6px; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; vertical-align: top; }
  .right { text-align: right; white-space: nowrap; }
  .total-row td { font-weight: bold; font-size: 13px; padding-top: 4px; }
  .footer { text-align: center; margin-top: 10px; font-size: 10px; color: #444; }
</style>
</head>
<body>
  <h1>${escapeHtml(data.storeName)}</h1>
  <div class="muted">${escapeHtml(data.receiptNumber)}${data.createdAt ? ' · ' + escapeHtml(data.createdAt) : ''}</div>
  <hr />
  <table>${itemRows}</table>
  <hr />
  <table>
    <tr><td>VAT</td><td class="right">${formatKES(data.taxAmount)}</td></tr>
    <tr class="total-row"><td>TOTAL</td><td class="right">${formatKES(data.totalAmount)}</td></tr>
  </table>
  <hr />
  <div class="muted">${paymentLine}</div>
  <div class="muted">${etimsLine}</div>
  ${data.etimsQrUrl ? `<div class="muted">Verify: ${escapeHtml(data.etimsQrUrl)}</div>` : ''}
  <div class="footer">Thank you for shopping!</div>
  <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// ── ESC/POS byte layout (Web Bluetooth thermal printers, 58mm/80mm) ──

const ESC = 0x1b;
const GS = 0x1d;

function enc(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function concatBytes(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function buildReceiptEscPos(data: ReceiptData, width: 58 | 80 = 80): Uint8Array {
  const cols = width === 58 ? 32 : 42;
  const line = (l = '') => enc(l.slice(0, cols) + '\n');
  const center = (l: string) => concatBytes([new Uint8Array([ESC, 0x61, 1]), line(l), new Uint8Array([ESC, 0x61, 0])]);
  const bold = (bytes: Uint8Array) => concatBytes([new Uint8Array([ESC, 0x45, 1]), bytes, new Uint8Array([ESC, 0x45, 0])]);
  const kv = (k: string, v: string) => {
    const gap = Math.max(1, cols - k.length - v.length);
    return line(k + ' '.repeat(gap) + v);
  };
  const rule = () => line('-'.repeat(cols));

  const parts: Uint8Array[] = [
    new Uint8Array([ESC, 0x40]), // init
    center(data.storeName),
    center(data.receiptNumber),
    rule()
  ];

  for (const it of data.items) {
    parts.push(line(`${it.quantity} x ${it.product_name}`));
    parts.push(kv('', formatKES(it.line_total)));
  }

  parts.push(rule());
  parts.push(kv('VAT', formatKES(data.taxAmount)));
  parts.push(bold(kv('TOTAL', formatKES(data.totalAmount))));
  parts.push(rule());

  parts.push(line(data.paymentMethod === 'mpesa' ? `M-Pesa: ${data.mpesaCode || ''}` : 'Paid: Cash'));

  if (data.etimsCuin) {
    parts.push(line(`CU Invoice No: ${data.etimsCuin}`));
    if (data.etimsQrUrl) parts.push(line(`Verify: ${data.etimsQrUrl}`));
  } else {
    parts.push(line('Not fiscalized (eTIMS off)'));
  }

  parts.push(center('Thank you for shopping!'));
  parts.push(new Uint8Array([0x0a, 0x0a, 0x0a]));
  parts.push(new Uint8Array([GS, 0x56, 0x00])); // full cut, if supported

  return concatBytes(parts);
}
