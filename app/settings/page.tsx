'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_MPESA_CONFIG,
  getMpesaConfig,
  hasLiveCredentials,
  saveMpesaConfig,
  type MpesaConfig
} from '@/lib/mpesaConfig';
import LabelCard from '@/app/components/LabelCard';
import WaxSeal from '@/components/WaxSeal';

export default function SettingsPage() {
  const [config, setConfig] = useState<MpesaConfig>(DEFAULT_MPESA_CONFIG);
  const [showSecret, setShowSecret] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConfig(getMpesaConfig());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function update<K extends keyof MpesaConfig>(key: K, value: MpesaConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveMpesaConfig(config);
    setToast('Settings saved.');
  }

  const credentialsComplete = hasLiveCredentials(config);
  const effectiveModeIsLive = config.mode === 'live' && credentialsComplete;

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Store profile and payment configuration.</p>

      <div
        className={
          effectiveModeIsLive
            ? 'mt-6 flex items-center justify-between rounded-lg border border-[#78350f]/20 bg-[#78350f]/5 px-4 py-3'
            : 'mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'
        }
      >
        <p className={effectiveModeIsLive ? 'text-sm font-medium text-[#78350f]' : 'text-sm font-medium text-gray-700'}>
          {effectiveModeIsLive
            ? `Live M-Pesa mode active — shortcode ${config.shortcode} (${config.environment}).`
            : config.mode === 'live'
              ? 'Live mode selected, but credentials are incomplete — falling back to Simulation.'
              : 'Payments are faked for testing — no real M-Pesa calls are made.'}
        </p>
        <WaxSeal label={effectiveModeIsLive ? 'Live' : 'Simulation'} variant={effectiveModeIsLive ? 'active' : 'muted'} />
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <LabelCard crest>
          <h2 className="text-base font-semibold text-gray-900">M-Pesa configuration</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Switch between a safe simulator for testing and live Safaricom Daraja calls for real payments.
          </p>

          <div className="mt-5">
            <span className="block text-sm font-medium text-gray-700">Mode</span>
            <div className="mt-2 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => update('mode', 'simulation')}
                className={
                  config.mode === 'simulation'
                    ? 'rounded-md bg-[#78350f] px-4 py-2 text-sm font-medium text-white transition-colors'
                    : 'rounded-md px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900'
                }
              >
                Simulation
              </button>
              <button
                type="button"
                onClick={() => update('mode', 'live')}
                className={
                  config.mode === 'live'
                    ? 'rounded-md bg-[#78350f] px-4 py-2 text-sm font-medium text-white transition-colors'
                    : 'rounded-md px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900'
                }
              >
                Live Daraja API
              </button>
            </div>
          </div>

          {config.mode === 'live' && (
            <div className="mt-5">
              <span className="block text-sm font-medium text-gray-700">Environment</span>
              <div className="mt-2 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                {(['sandbox', 'production'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => update('environment', env)}
                    className={
                      config.environment === env
                        ? 'rounded-md bg-[#78350f] px-4 py-2 text-sm font-medium text-white transition-colors capitalize'
                        : 'rounded-md px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900 capitalize'
                    }
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Shortcode / Paybill">
              <input
                className="input"
                placeholder="174379"
                value={config.shortcode}
                onChange={(e) => update('shortcode', e.target.value)}
              />
            </Field>

            <Field label="Lipa Na M-Pesa Passkey">
              <div className="relative">
                <input
                  className="input pr-16"
                  type={showPasskey ? 'text' : 'password'}
                  placeholder="•••••••••••••••"
                  value={config.passkey}
                  onChange={(e) => update('passkey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B7280] hover:text-gray-900"
                >
                  {showPasskey ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>

            <Field label="Consumer Key">
              <input
                className="input"
                placeholder="Daraja app consumer key"
                value={config.consumerKey}
                onChange={(e) => update('consumerKey', e.target.value)}
              />
            </Field>

            <Field label="Consumer Secret">
              <div className="relative">
                <input
                  className="input pr-16"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="•••••••••••••••"
                  value={config.consumerSecret}
                  onChange={(e) => update('consumerSecret', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B7280] hover:text-gray-900"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
            These values are stored only in this browser&apos;s local storage, never sent anywhere except directly to
            Safaricom when a Live payment is triggered. On a shared or public device, anyone with browser access could
            read them — treat this device as trusted, or stay in Simulation mode.
          </p>
        </LabelCard>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-[#78350f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5c2a0c]">
            Save Settings
          </button>
          {toast && (
            <span className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">{toast}</span>
          )}
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
        }
        .input:focus {
          outline: none;
          border-color: #78350f;
          box-shadow: 0 0 0 3px rgba(120, 53, 15, 0.12);
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
