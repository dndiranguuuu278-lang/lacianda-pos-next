import { NextRequest, NextResponse } from 'next/server';

// This route deliberately does NOT read Safaricom credentials from process.env.
// The whole point of "Live mode" here is that credentials come from the
// Settings page (stored client-side in localStorage) and are sent per-request
// — so switching shortcodes/keys never needs a redeploy. The trade-off is
// that these secrets do travel over this request; only call this route over
// HTTPS in production.

import type { StkPushBody } from '@/types';

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '254');
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as StkPushBody;
  const { consumerKey, consumerSecret, shortcode, passkey, environment = 'sandbox', phone, amount } = body;

  if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
    return NextResponse.json(
      { error: 'Live M-Pesa credentials are incomplete. Add them in Settings, or switch back to Simulation mode.' },
      { status: 400 }
    );
  }
  if (!phone || !amount) {
    return NextResponse.json({ error: 'phone and amount are required' }, { status: 400 });
  }

  const baseUrl = environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

  try {
    // 1. OAuth token
    const creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${creds}` },
      cache: 'no-store'
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json({ error: `Daraja auth failed: ${tokenRes.status} ${text}` }, { status: 502 });
    }
    const { access_token: accessToken } = await tokenRes.json();

    // 2. STK push
    const ts = timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
    const normalizedPhone = normalizePhone(phone);

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: `${req.nextUrl.origin}/api/mpesa/callback`,
        AccountReference: 'LaciandaWines',
        TransactionDesc: 'POS Sale'
      }),
      cache: 'no-store'
    });

    const stkData = await stkRes.json();
    if (!stkRes.ok || stkData.errorCode) {
      return NextResponse.json({ error: stkData.errorMessage || `STK push failed: ${stkRes.status}` }, { status: 502 });
    }

    return NextResponse.json({
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      message: stkData.CustomerMessage || 'STK push sent — ask the customer to enter their M-Pesa PIN.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error contacting Safaricom' }, { status: 500 });
  }
}
