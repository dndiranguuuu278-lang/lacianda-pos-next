'use client';

import { useRef, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';

export default function ImportPage() {
  const { loading } = useRequireSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ upserted: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file');
      return;
    }
    setError('');
    setResult(null);
    setImporting(true);
    try {
      const res = await api.importCsv(file);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  if (loading) return null;

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ marginBottom: 8 }}>Bulk inventory import</h2>
      <p style={{ color: 'var(--ink-dim)', marginBottom: 20, lineHeight: 1.5 }}>
        Upload a CSV with columns <code>Name, Category, Buying Price, Selling Price, Stock Quantity, Barcode</code>.
        Rows are matched by product name and <strong>upserted</strong> — re-uploading the same file safely updates
        existing stock instead of duplicating it, and changes sync to every connected till immediately.
      </p>

      <div
        className="glass"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileRef.current?.click()}
        style={{
          padding: 40,
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderColor: dragOver ? 'var(--accent)' : 'var(--glass-border)'
        }}
      >
        <p style={{ fontSize: '2rem', marginBottom: 8 }}>📄</p>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop a CSV file here, or click to browse</p>
        <p style={{ color: 'var(--ink-dim)', fontSize: '0.85rem' }}>Max 5MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {importing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
          <span style={{ color: 'var(--ink-dim)' }}>Importing…</span>
        </div>
      )}

      {error && <p style={{ color: 'var(--rose)', marginTop: 16 }}>{error}</p>}

      {result && (
        <div className="glass" style={{ padding: 16, marginTop: 16 }}>
          <p style={{ fontWeight: 600, color: 'var(--accent)' }}>
            Synced {result.upserted} of {result.total} products.
          </p>
          {result.errors.length > 0 && (
            <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--amber)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/api/products/csv/export" className="btn btn-ghost">
          Download current inventory as CSV (for a starting template)
        </a>
      </div>
    </div>
  );
}
