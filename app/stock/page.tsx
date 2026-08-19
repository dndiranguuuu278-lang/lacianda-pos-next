'use client';

import { useEffect, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';
import { formatKES } from '@/lib/receipt';

interface Product {
  id: string;
  name: string;
  category: string | null;
  buying_price: string;
  selling_price: string;
  stock_qty: number;
  barcode: string | null;
}

const emptyForm = { id: '', name: '', category: '', buying_price: '', selling_price: '', stock_qty: '0', barcode: '' };

export default function StockPage() {
  const { user, loading } = useRequireSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function refresh() {
    try {
      const { products } = await api.listProducts();
      setProducts(products);
    } catch (err: any) {
      setToast(err.message);
    }
  }

  function openModal(p?: Product) {
    setForm(
      p
        ? { id: p.id, name: p.name, category: p.category || '', buying_price: p.buying_price, selling_price: p.selling_price, stock_qty: String(p.stock_qty), barcode: p.barcode || '' }
        : emptyForm
    );
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      buying_price: parseFloat(form.buying_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      stock_qty: parseInt(form.stock_qty, 10) || 0,
      barcode: form.barcode || null
    };
    try {
      if (form.id) await api.updateProduct(form.id, payload);
      else await api.createProduct(payload);
      setModalOpen(false);
      refresh();
    } catch (err: any) {
      setToast(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this product?')) return;
    try {
      await api.deleteProduct(id);
      refresh();
    } catch (err: any) {
      setToast(err.message);
    }
  }

  if (loading) return null;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2>Inventory</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/api/products/csv/export" className="btn btn-ghost">Export CSV</a>
          <button className="btn btn-primary" onClick={() => openModal()}>+ Product</button>
        </div>
      </div>

      <div className="glass" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--glass)', color: 'var(--ink-dim)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Category</th>
              <th style={cellStyle}>Buy</th>
              <th style={cellStyle}>Sell</th>
              <th style={cellStyle}>Stock</th>
              <th style={cellStyle}>Barcode</th>
              <th style={cellStyle}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={cellStyle}>{p.name}</td>
                <td style={cellStyle}>{p.category || '—'}</td>
                <td style={cellStyle}>{formatKES(Number(p.buying_price))}</td>
                <td style={cellStyle}>{formatKES(Number(p.selling_price))}</td>
                <td style={{ ...cellStyle, color: p.stock_qty <= 5 ? 'var(--amber)' : undefined, fontWeight: p.stock_qty <= 5 ? 600 : undefined }}>
                  {p.stock_qty}
                </td>
                <td style={cellStyle}>{p.barcode || '—'}</td>
                <td style={cellStyle}>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => openModal(p)}>✎</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => handleDelete(p.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p style={{ padding: 16, color: 'var(--ink-dim)' }}>No products yet. Add one, or use Import for bulk CSV upload.</p>}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,6,12,0.68)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>{form.id ? 'Edit product' : 'Add product'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={labelStyle}>Name<input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label style={labelStyle}>Category<input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={labelStyle}>Buying price<input className="input" type="number" step="0.01" value={form.buying_price} onChange={(e) => setForm({ ...form, buying_price: e.target.value })} /></label>
                <label style={labelStyle}>Selling price<input className="input" type="number" step="0.01" required value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={labelStyle}>Stock qty<input className="input" type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} /></label>
                <label style={labelStyle}>Barcode<input className="input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <p style={{ color: 'var(--rose)', marginTop: 12 }}>{toast}</p>}
    </div>
  );
}

const cellStyle: React.CSSProperties = { textAlign: 'left', padding: '11px 14px', whiteSpace: 'nowrap' };
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--ink-dim)' };
