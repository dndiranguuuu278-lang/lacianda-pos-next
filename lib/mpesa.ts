// M-Pesa Daraja API client: OAuth token exchange + STK push (Lipa na M-Pesa
// Online). Requires MPESA_* env vars — see .env.example. Sandbox host is
// used unless MPESA_ENV=production.

const BASE_URL =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

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

export async function getAccessToken(): Promise<string> {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error('MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not configured');
  }
  const creds = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

export interface StkPushParams {
  phone: string;
  amount: number;
  accountRef: string;
  description: string;
}

export interface StkPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/** Normalizes a Kenyan phone number to Safaricom's expected 2547XXXXXXXX / 2541XXXXXXXX format. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '254');
}

/** Initiates an STK push prompt on the customer's phone. */
export async function stkPush({ phone, amount, accountRef, description }: StkPushParams): Promise<StkPushResult> {
  const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;
  if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
    throw new Error('MPESA_SHORTCODE / MPESA_PASSKEY / MPESA_CALLBACK_URL not configured');
  }

  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${ts}`).toString('base64');
  const normalizedPhone = normalizePhone(phone);

  const body = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: ts,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: normalizedPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: normalizedPhone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: accountRef.slice(0, 12),
    TransactionDesc: description.slice(0, 13)
  };

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  const data = await res.json();
  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage || `STK push failed: ${res.status}`);
  }
  return data as StkPushResult;
}

export interface StkCallbackMetadataItem {
  Name: string;
  Value?: string | number;
}

export interface ParsedStkCallback {
  checkoutRequestId: string;
  merchantRequestId: string;
  resultCode: number;
  resultDesc: string;
  mpesaReceiptNumber?: string;
  amount?: number;
  phoneNumber?: string;
  transactionDate?: string;
}

/** Parses Safaricom's nested STK callback webhook body into a flat shape. */
export function parseStkCallback(body: any): ParsedStkCallback | null {
  const cb = body?.Body?.stkCallback;
  if (!cb) return null;
  const items: StkCallbackMetadataItem[] = cb.CallbackMetadata?.Item || [];
  const meta = Object.fromEntries(items.map((i) => [i.Name, i.Value]));
  return {
    checkoutRequestId: cb.CheckoutRequestID,
    merchantRequestId: cb.MerchantRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    mpesaReceiptNumber: meta.MpesaReceiptNumber as string | undefined,
    amount: meta.Amount as number | undefined,
    phoneNumber: meta.PhoneNumber ? String(meta.PhoneNumber) : undefined,
    transactionDate: meta.TransactionDate ? String(meta.TransactionDate) : undefined
  };
}
