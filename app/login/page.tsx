'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '344066291812-ek6nmskdibqm7fqa0l1v19mougs2ev6c.apps.googleusercontent.com';

export default function LoginPage() {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // If already signed in, skip straight to the till.
    api.me().then(() => router.replace('/')).catch(() => {});
  }, [router]);

  useEffect(() => {
    function tryInit() {
      if (!window.google?.accounts?.id || !btnRef.current) {
        setTimeout(tryInit, 300);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            await api.googleLogin(response.credential);
            router.replace('/');
          } catch (err: any) {
            setError(err.message);
          }
        }
      });
      window.google.accounts.id.renderButton(btnRef.current, { theme: 'filled_black', shape: 'pill', size: 'large' });
    }
    tryInit();
  }, [router]);

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.pinLogin(email, pin);
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480 }}>
      <p style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', fontSize: '0.75rem', marginBottom: 10 }}>
        Mobile-first · Kenyan retail
      </p>
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 2.8rem)', lineHeight: 1.05, marginBottom: 14 }}>The till in your pocket.</h1>
      <p style={{ color: 'var(--ink-dim)', lineHeight: 1.55, marginBottom: 28 }}>
        M-Pesa STK push, KRA eTIMS fiscal receipts, and silent thermal printing — sign in to open the till.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div ref={btnRef} />
        <button className="btn btn-ghost" onClick={() => setShowPinForm((s) => !s)}>
          Sign in with PIN
        </button>
      </div>

      {showPinForm && (
        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, maxWidth: 320 }}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            className="input"
            type="password"
            inputMode="numeric"
            placeholder="4-6 digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Unlock till
          </button>
          {error && <p style={{ color: 'var(--rose)', fontSize: '0.85rem' }}>{error}</p>}
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
        <div className="ticket" style={{ width: 240 }}>
          <div className="ticket-row"><span>Ginger &amp; garlic paste</span><span>KES 120</span></div>
          <div className="ticket-row"><span>Cooking oil 2L</span><span>KES 480</span></div>
          <div className="ticket-row dashed" />
          <div className="ticket-row total"><span>TOTAL</span><span>KES 600</span></div>
          <div className="ticket-row muted"><span>M-Pesa · SFC2K9XJQ1</span></div>
        </div>
      </div>
    </div>
  );
}
