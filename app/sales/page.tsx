'use client';

import { useEffect, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';
import { formatKES } from '@/lib/receipt';

interface Sale {
  id: string;
  receipt_number: string;
  total_amount: string;
  payment_method: string;
  etims_cuin: string | null;
  created_at: string;
}

export default function SalesPage() {
  const { user, loading } = useRequireSession();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (user) {
      api.listSales().then(({ sales }) => setSales(sales)).catch(() => {});
    }
  }, [user]);

  if (loading) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Sales history</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sales.map((s) => (
          <div key={s.id} className="glass" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
            <div>
              <div>{s.receipt_number}</div>
              <div style={{ color: 'var(--ink-dim)', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
                {new Date(s.created_at).toLocaleString('en-KE')} · {s.payment_method}
                {s.etims_cuin ? ' · fiscalized' : ' · not fiscalized'}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{formatKES(Number(s.total_amount))}</span>
          </div>
        ))}
        {!sales.length && <p style={{ color: 'var(--ink-dim)' }}>No sales yet.</p>}
      </div>
    </div>
  );
}
