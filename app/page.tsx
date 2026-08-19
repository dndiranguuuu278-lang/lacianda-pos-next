'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';
import { buildReceiptHtml, formatKES, type ReceiptData } from '@/lib/receipt';
import { pairedPrinterName, isPrinterPaired, printReceipt } from '@/lib/printer';

interface Product {
  id: string;
  name: string;
  category: string | null;
  selling_price: string;
  stock_qty: number;
  barcode: string | null;
}

interface CartLine {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

type CheckoutStatus = 'idle' | 'pending' | 'paid' | 'failed';

export default function TillPage() {
  const { user, loading } = useRequireSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<'cash' | 'mpesa'>('cash');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [storeName, setStoreName] = useState('Lacianda POS');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) return;
    refreshProducts();
    api.getSettings().then(({ settings }) => settings?.store_name && setStoreName(settings.store_name)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function refreshProducts() {
    try {
      const { products } = await api.listProducts();
      setProducts(products);
    } catch (err: any) {
      setToast(err.message);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q));
  }, [products, search]);

  function addToCart(product: Product) {
    if (product.stock_qty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock_qty) {
          setToast('Not enough stock');
          return prev;
        }
        return prev.map((c) => (c.product_id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { product_id: product.id, name: product.name, price: Number(product.selling_price), qty: 1, stock: product.stock_qty }];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.product_id === productId ? { ...c, qty: Math.min(c.qty + delta, c.stock) } : c))
        .filter((c) => c.qty > 0)
    );
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = +(subtotal - subtotal / 1.16).toFixed(2);

  async function handleCheckout() {
    const items = cart.map((c) => ({ product_id: c.product_id, quantity: c.qty }));

    if (method === 'cash') {
      setStatus('pending');
      setStatusMessage('Recording sale…');
      try {
        const { sale, items: soldItems } = await api.checkout({ items, payment_method: 'cash' });
        api.submitEtims(sale.id).catch(() => {});
        buildAndShowReceipt(sale, soldItems, 'cash');
        refreshProducts();
      } catch (err: any) {
        setStatus('failed');
        setStatusMessage(err.message);
      }
      return;
    }

    setStatus('pending');
    setStatusMessage('Sending M-Pesa prompt…');
    try {
      const { checkoutRequestId } = await api.stkPush({ items, phone });
      setStatusMessage('Waiting for customer to enter M-Pesa PIN…');
      listenForPayment(checkoutRequestId, cart);
    } catch (err: any) {
      setStatus('failed');
      setStatusMessage(err.message);
    }
  }

  function listenForPayment(checkoutRequestId: string, cartSnapshot: CartLine[]) {
    const es = new EventSource(`/api/payments/stream/${checkoutRequestId}`);
    es.addEventListener('status', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      es.close();
      if (data.status === 'paid') {
        const items = cartSnapshot.map((c) => ({ product_name: c.name, quantity: c.qty, unit_price: c.price, line_total: c.price * c.qty }));
        const receiptData: ReceiptData = {
          storeName,
          receiptNumber: data.receiptNumber,
          items,
          taxAmount: +(data.amount - data.amount / 1.16).toFixed(2),
          totalAmount: data.amount,
          paymentMethod: 'mpesa',
          mpesaCode: data.mpesaCode,
          etimsCuin: data.etimsCuin,
          etimsQrUrl: data.etimsQrUrl,
          createdAt: new Date().toLocaleString('en-KE')
        };
        setReceipt(receiptData);
        setStatus('paid');
        refreshProducts();
        maybeAutoPrint(receiptData);
      } else {
        setStatus('failed');
        setStatusMessage(data.message || 'Payment failed');
      }
    });
    es.onerror = () => {
      /* SSE auto-reconnects; overlay stays on "waiting" */
    };
  }

  function buildAndShowReceipt(sale: any, items: any[], paymentMethod: 'cash' | 'mpesa') {
    const data: ReceiptData = {
      storeName,
      receiptNumber: sale.receipt_number,
      items,
      taxAmount: Number(sale.tax_amount),
      totalAmount: Number(sale.total_amount),
      paymentMethod,
      mpesaCode: sale.mpesa_code,
      etimsCuin: sale.etims_cuin,
      etimsQrUrl: sale.etims_qr_url,
      createdAt: new Date().toLocaleString('en-KE')
    };
    setReceipt(data);
    setStatus('paid');
    maybeAutoPrint(data);
  }

  function maybeAutoPrint(data: ReceiptData) {
    if (isPrinterPaired()) {
      printReceipt(data).catch((err) => setToast(`Print failed: ${err.message}`));
    }
  }

  function printViaBrowser() {
    if (!receipt) return;
    const html = buildReceiptHtml(receipt);
    const win = window.open('', '_blank', 'width=380,height=600');
    if (!win) return setToast('Pop-up blocked — allow pop-ups to print');
    win.document.write(html);
    win.document.close();
  }

  async function printViaBluetooth() {
    if (!receipt) return;
    try {
      if (!isPrinterPaired()) {
        const { pairPrinter } = await import('@/lib/printer');
        await pairPrinter();
      }
      await printReceipt(receipt);
      setToast('Sent to printer');
    } catch (err: any) {
      setToast(err.message);
    }
  }

  function resetTill() {
    setCart([]);
    setReceipt(null);
    setStatus('idle');
    setPhone('');
  }

  if (loading) return <CenteredSpinner />;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-[1.6fr_1fr]">
        <div>
          <input className="input" placeholder="Search products or scan barcode…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div style={{ marginTop: 12, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {filtered.map((p) => {
              const low = p.stock_qty > 0 && p.stock_qty <= 5;
              const out = p.stock_qty <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={out}
                  className="glass"
                  style={{ padding: 12, textAlign: 'left', cursor: out ? 'not-allowed' : 'pointer', opacity: out ? 0.4 : 1 }}
                >
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: 6 }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85rem' }}>{formatKES(Number(p.selling_price))}</span>
                  <span style={{ display: 'block', marginTop: 4, fontSize: '0.72rem', color: low ? 'var(--amber)' : 'var(--ink-dim)' }}>
                    {out ? 'Out of stock' : `${p.stock_qty} in stock`}
                  </span>
                </button>
              );
            })}
            {!filtered.length && <p style={{ color: 'var(--ink-dim)' }}>No products found. Add stock from the Stock tab.</p>}
          </div>
        </div>

        <aside className="glass" style={{ padding: 16, position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 12, height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem' }}>Cart</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '32vh', overflowY: 'auto' }}>
            {cart.map((c) => (
              <div key={c.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span>{c.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => changeQty(c.product_id, -1)}>−</button>
                  {c.qty}
                  <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => changeQty(c.product_id, 1)}>+</button>
                </span>
                <span>{formatKES(c.price * c.qty)}</span>
              </div>
            ))}
            {!cart.length && <p style={{ color: 'var(--ink-dim)', fontSize: '0.85rem' }}>Tap a product to add it.</p>}
          </div>

          <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: 10, fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatKES(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VAT (16%)</span><span>{formatKES(tax)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--accent)', fontSize: '1.05rem', paddingTop: 6 }}>
              <span>Total</span><span>{formatKES(subtotal)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMethod('cash')}
              className="btn"
              style={{ flex: 1, background: method === 'cash' ? 'var(--accent)' : 'transparent', color: method === 'cash' ? 'var(--accent-ink)' : 'var(--ink-dim)' }}
            >
              Cash
            </button>
            <button
              onClick={() => setMethod('mpesa')}
              className="btn"
              style={{ flex: 1, background: method === 'mpesa' ? 'var(--accent)' : 'transparent', color: method === 'mpesa' ? 'var(--accent-ink)' : 'var(--ink-dim)' }}
            >
              M-Pesa
            </button>
          </div>

          {method === 'mpesa' && (
            <input className="input" type="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          )}

          <button
            onClick={handleCheckout}
            disabled={!cart.length || (method === 'mpesa' && !/^0?7\d{8}$/.test(phone.replace(/\s+/g, '')))}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Charge cart
          </button>
        </aside>
      </div>

      {status !== 'idle' && (
        <CheckoutOverlay
          status={status}
          statusMessage={statusMessage}
          receipt={receipt}
          onCancel={resetTill}
          onNewSale={resetTill}
          onPrintBrowser={printViaBrowser}
          onPrintBluetooth={printViaBluetooth}
          printerName={pairedPrinterName()}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }} className="glass">
          <p style={{ padding: '10px 18px', fontSize: '0.85rem' }}>{toast}</p>
        </div>
      )}
    </div>
  );
}

function CheckoutOverlay({
  status,
  statusMessage,
  receipt,
  onCancel,
  onNewSale,
  onPrintBrowser,
  onPrintBluetooth,
  printerName
}: {
  status: CheckoutStatus;
  statusMessage: string;
  receipt: ReceiptData | null;
  onCancel: () => void;
  onNewSale: () => void;
  onPrintBrowser: () => void;
  onPrintBluetooth: () => void;
  printerName: string | null;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,6,12,0.68)', backdropFilter: 'blur(6px)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, padding: 24, maxHeight: '88vh', overflowY: 'auto' }}>
        {status === 'pending' && (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--ink-dim)', marginBottom: 18 }}>{statusMessage}</p>
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          </div>
        )}

        {status === 'paid' && receipt && (
          <div>
            <div className="ticket" style={{ marginBottom: 16 }}>
              <div className="ticket-row" style={{ justifyContent: 'center', fontFamily: 'var(--font-display)', paddingBottom: 8 }}>
                <strong>{receipt.storeName}</strong>
              </div>
              <div className="ticket-row muted" style={{ justifyContent: 'center' }}><span>{receipt.receiptNumber}</span></div>
              <div className="ticket-row dashed" />
              {receipt.items.map((it, i) => (
                <div className="ticket-row" key={i}><span>{it.quantity} x {it.product_name}</span><span>{formatKES(it.line_total)}</span></div>
              ))}
              <div className="ticket-row dashed" />
              <div className="ticket-row"><span>VAT</span><span>{formatKES(receipt.taxAmount)}</span></div>
              <div className="ticket-row total"><span>TOTAL</span><span>{formatKES(receipt.totalAmount)}</span></div>
              <div className="ticket-row muted"><span>{receipt.paymentMethod === 'mpesa' ? `M-Pesa · ${receipt.mpesaCode}` : 'Paid · Cash'}</span></div>
              <div className="ticket-row muted"><span>{receipt.etimsCuin ? `KRA CU Invoice: ${receipt.etimsCuin}` : 'Not fiscalized (eTIMS not configured)'}</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={onPrintBluetooth}>
                🖨 {printerName ? `Print (${printerName})` : 'Pair & print (Bluetooth)'}
              </button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onPrintBrowser}>Print via browser</button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onNewSale}>New sale</button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--rose)', marginBottom: 16 }}>{statusMessage}</p>
            <button className="btn btn-primary" onClick={onCancel}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CenteredSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '30vh' }}>
      <div className="spinner" />
    </div>
  );
}
