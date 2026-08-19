'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';

const LINKS = [
  { href: '/', label: 'Till', icon: '🧾' },
  { href: '/stock', label: 'Stock', icon: '📦' },
  { href: '/import', label: 'Import', icon: '📄' },
  { href: '/sales', label: 'Sales', icon: '📊' },
  { href: '/etims-queue', label: 'eTIMS', icon: '🧮' },
  { href: '/settings', label: 'Settings', icon: '⚙️' }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const [storeName, setStoreName] = useState('Lacianda POS');

  useEffect(() => {
    api.me().then(({ user }) => setUser(user)).catch(() => setUser(null));
    api.getSettings().then(({ settings }) => settings?.store_name && setStoreName(settings.store_name)).catch(() => {});
  }, [pathname]);

  if (pathname === '/login') return null;

  async function handleLogout() {
    await api.logout();
    router.replace('/login');
  }

  return (
    <>
      <header
        className="glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'linear-gradient(135deg, var(--accent), #059669)',
              color: 'var(--accent-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            L
          </span>
          <span>{storeName}</span>
        </div>

        <nav style={{ display: 'none', gap: 4 }} className="md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="btn btn-ghost"
              style={{
                borderColor: pathname === l.href ? 'var(--accent)' : 'transparent',
                color: pathname === l.href ? 'var(--accent)' : 'var(--ink)'
              }}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && <span style={{ fontSize: '0.82rem', color: 'var(--ink-dim)' }}>{user.name || user.email}</span>}
          <button onClick={handleLogout} className="btn btn-ghost" title="Log out">
            ⏻
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="glass"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-around',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          padding: '8px 4px calc(8px + env(safe-area-inset-bottom))'
        }}
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.66rem',
              padding: '6px 10px',
              borderRadius: 10,
              color: pathname === l.href ? 'var(--accent)' : 'var(--ink-dim)',
              textDecoration: 'none'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
