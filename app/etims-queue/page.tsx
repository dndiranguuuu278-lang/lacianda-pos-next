'use client';

import { useEffect, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';

interface QueueRow {
  id: string;
  sale_id: string;
  receipt_number: string;
  status: 'pending' | 'submitted' | 'failed';
  attempts: number;
  last_error: string | null;
  cuin: string | null;
  created_at: string;
  updated_at: string;
}

const FILTERS: { label: string; value?: string }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Submitted', value: 'submitted' }
];

export default function EtimsQueuePage() {
  const { user, loading } = useRequireSession();
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) refresh();
  }, [user, filter]);

  async function refresh() {
    try {
      const { queue } = await api.listEtimsQueue(filter);
      setRows(queue);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRetry(id: string) {
    setRetrying(id);
    try {
      await api.retryEtims(id);
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRetrying(null);
    }
  }

  if (loading) return null;

  const pendingCount = rows.filter((r) => r.status !== 'submitted').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
        <h2>eTIMS submission queue</h2>
        {pendingCount > 0 && <span className="badge badge-pending">{pendingCount} awaiting fiscalization</span>}
      </div>
      <p style={{ color: 'var(--ink-dim)', marginBottom: 16, lineHeight: 1.5 }}>
        Every invoice attempt sent to KRA is logged here — this doubles as your compliance audit trail. Sales that
        couldn&apos;t reach eTIMS (offline till, KRA downtime, missing onboarding) stay <strong>pending</strong> or{' '}
        <strong>failed</strong> here rather than blocking checkout; retry them once connectivity is restored.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className="btn"
            style={{
              background: filter === f.value ? 'var(--accent)' : 'transparent',
              color: filter === f.value ? 'var(--accent-ink)' : 'var(--ink-dim)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--rose)', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.id} className="glass" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.receipt_number}</div>
                <div style={{ color: 'var(--ink-dim)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {new Date(r.updated_at).toLocaleString('en-KE')} · {r.attempts} attempt{r.attempts === 1 ? '' : 's'}
                </div>
                {r.cuin && <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 4 }}>CU Invoice: {r.cuin}</div>}
                {r.last_error && <div style={{ fontSize: '0.8rem', color: 'var(--rose)', marginTop: 4 }}>{r.last_error}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
                {r.status !== 'submitted' && (
                  <button className="btn btn-ghost" disabled={retrying === r.id} onClick={() => handleRetry(r.id)}>
                    {retrying === r.id ? 'Retrying…' : 'Retry'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!rows.length && <p style={{ color: 'var(--ink-dim)' }}>No submissions in this filter yet.</p>}
      </div>
    </div>
  );
}
