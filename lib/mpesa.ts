import { getMpesaConfig, resolveEffectiveMode } from './mpesaConfig';

export interface StkPushResult {
  success: boolean;
  message: string;
  mpesaCode?: string;
  checkoutRequestId?: string;
  /** True if this result came from the simulator rather than a real Daraja call. */
  simulated: boolean;
}

function randomCode(prefix: string, length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = prefix;
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fake STK push: a delay to mimic the customer's phone prompt, then a random (mostly successful) outcome. */
async function simulateStkPush(phone: string, amount: number): Promise<StkPushResult> {
  const checkoutRequestId = randomCode('ws_', 10);
  await delay(1800 + Math.random() * 1400);

  const succeeds = Math.random() < 0.85; // occasional simulated decline/timeout, like a real till sees
  if (!succeeds) {
    return {
      success: false,
      simulated: true,
      checkoutRequestId,
      message: 'Simulated payment failed — customer cancelled or PIN timeout.'
    };
  }

  return {
    success: true,
    simulated: true,
    checkoutRequestId,
    mpesaCode: randomCode('S', 9),
    message: `Simulated payment of KES ${amount.toLocaleString('en-KE')} confirmed for ${phone}.`
  };
}

/** Real STK push via the server-side Daraja proxy route, using whatever credentials are currently stored. */
async function liveStkPush(phone: string, amount: number): Promise<StkPushResult> {
  const config = getMpesaConfig();

  const res = await fetch('/api/mpesa/stk-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      shortcode: config.shortcode,
      passkey: config.passkey,
      environment: config.environment,
      phone,
      amount
    })
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      simulated: false,
      message: data.error || `Daraja request failed (${res.status})`
    };
  }

  return {
    success: true,
    simulated: false,
    checkoutRequestId: data.checkoutRequestId,
    message: data.message || 'STK push sent — ask the customer to enter their M-Pesa PIN.'
  };
}

/**
 * Single entry point the Till page calls. Decides simulation vs. live based
 * on the stored config — Live is only actually used if credentials are
 * complete; otherwise this transparently runs the simulator instead of
 * failing the sale.
 */
export async function initiateStkPush(phone: string, amount: number): Promise<StkPushResult> {
  const config = getMpesaConfig();
  const mode = resolveEffectiveMode(config);
  return mode === 'live' ? liveStkPush(phone, amount) : simulateStkPush(phone, amount);
}
