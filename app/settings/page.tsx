'use client';

import { useEffect, useState } from 'react';
import { useRequireSession } from '@/hooks/useSession';
import { api } from '@/lib/apiClient';

export default function SettingsPage() {
  const { user, loading } = useRequireSession();
  const [storeName, setStoreName] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [mpesaShortcode, setMpesaShortcode] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  const [printerName, setPrinterName] = useState<string | null>(null);
  const [printerError, setPrinterError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getSettings().then(({ settings }) => {
      if (!settings) return;
      setStoreName(settings.store_name || '');
      setKraPin(settings.kra_pin || '');
      setMpesaShortcode(settings.mpesa_shortcode || '');
      setThemeMode(settings.theme_mode || 'dark');
      setAccentColor(settings.accent_color?.startsWith('#') ? settings.accent_color : '#10b981');
    });
    import('@/lib/printer').then((m) => setPrinterName(m.pairedPrinterName()));
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [themeMode, accentColor]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.updateSettings({ store_name: storeName, kra_pin: kraPin, mpesa_shortcode: mpesaShortcode, theme_mode: themeMode, accent_color: accentColor });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.setPin(newPin);
      setPinSaved(true);
      setNewPin('');
      setTimeout(() => setPinSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handlePairPrinter() {
    setPrinterError('');
    try {
      const { pairPrinter } = await import('@/lib/printer');
      const name = await pairPrinter();
      setPrinterName(name);
    } catch (err: any) {
      setPrinterError(err.message);
    }
  }

  if (loading) return null;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 16 }}>Store &amp; tax settings</h2>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Store name">
          <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </Field>
        <Field label="KRA PIN">
          <input className="input" placeholder="P0XXXXXXXXX" value={kraPin} onChange={(e) => setKraPin(e.target.value)} />
        </Field>
        <Field label="M-Pesa shortcode">
          <input className="input" placeholder="174379" value={mpesaShortcode} onChange={(e) => setMpesaShortcode(e.target.value)} />
        </Field>

        <Field label="Theme mode">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['dark', 'light'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className="btn"
                style={{ flex: 1, background: themeMode === mode ? 'var(--accent)' : 'transparent', color: themeMode === mode ? 'var(--accent-ink)' : 'var(--ink-dim)' }}
                onClick={() => setThemeMode(mode)}
              >
                {mode === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Accent color">
          <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 60, height: 38, background: 'none', border: '1px solid var(--glass-border)', borderRadius: 8 }} />
        </Field>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save settings</button>
        {saved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Saved.</p>}
        {error && <p style={{ color: 'var(--rose)', fontSize: '0.85rem' }}>{error}</p>}
      </form>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--glass-border)' }}>
        <h3 style={{ marginBottom: 8 }}>Receipt printer</h3>
        <p style={{ color: 'var(--ink-dim)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 12 }}>
          Pair an 80mm or 58mm ESC/POS Bluetooth thermal printer for silent auto-printing on payment confirmation.
        </p>
        <button className="btn btn-ghost" onClick={handlePairPrinter}>Pair Bluetooth printer</button>
        <span style={{ marginLeft: 10, fontSize: '0.8rem', color: printerName ? 'var(--accent)' : 'var(--ink-dim)' }}>
          {printerName ? `Paired: ${printerName}` : 'Not paired'}
        </span>
        {printerError && <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: 8 }}>{printerError}</p>}
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--glass-border)' }}>
        <h3 style={{ marginBottom: 8 }}>Backup PIN</h3>
        <p style={{ color: 'var(--ink-dim)', fontSize: '0.85rem', marginBottom: 12 }}>
          Set a PIN so you can log in on this till without Google.
        </p>
        <form onSubmit={handleSetPin} style={{ display: 'flex', gap: 10 }}>
          <input className="input" type="password" inputMode="numeric" placeholder="4-6 digit PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} />
          <button type="submit" className="btn btn-ghost">Set PIN</button>
        </form>
        {pinSaved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: 8 }}>PIN saved.</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--ink-dim)' }}>
      {label}
      {children}
    </label>
  );
}
