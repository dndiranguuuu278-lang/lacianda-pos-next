export type MpesaMode = 'simulation' | 'live';
export type MpesaEnvironment = 'sandbox' | 'production';

export interface MpesaConfig {
  mode: MpesaMode;
  environment: MpesaEnvironment;
  shortcode: string;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
}

export const MPESA_CONFIG_STORAGE_KEY = 'lacianda_pos_config';

export const DEFAULT_MPESA_CONFIG: MpesaConfig = {
  mode: 'simulation',
  environment: 'sandbox',
  shortcode: '',
  passkey: '',
  consumerKey: '',
  consumerSecret: ''
};

/** Reads the stored M-Pesa config. Always safe to call during SSR — returns defaults if no window/storage. */
export function getMpesaConfig(): MpesaConfig {
  if (typeof window === 'undefined') return DEFAULT_MPESA_CONFIG;
  try {
    const raw = window.localStorage.getItem(MPESA_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_MPESA_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MPESA_CONFIG, ...parsed };
  } catch {
    return DEFAULT_MPESA_CONFIG;
  }
}

export function saveMpesaConfig(config: MpesaConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MPESA_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

/** True only when every field Live mode needs to actually call Daraja is present. */
export function hasLiveCredentials(config: MpesaConfig): boolean {
  return Boolean(config.shortcode && config.passkey && config.consumerKey && config.consumerSecret);
}

/**
 * The mode the app should actually use for the next STK push — not
 * necessarily what the user selected. If Live is selected but credentials
 * are incomplete, this safely falls back to Simulation instead of letting a
 * checkout hang or fail against a half-configured integration.
 */
export function resolveEffectiveMode(config: MpesaConfig): MpesaMode {
  if (config.mode === 'live' && hasLiveCredentials(config)) return 'live';
  return 'simulation';
}
