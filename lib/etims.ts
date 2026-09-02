// KRA eTIMS (electronic Tax Invoice Management System) integration.
//
// IMPORTANT: real eTIMS onboarding requires a registered Control Unit
// (OSCU software-based, or VSCU via a certified ETR device) issued
// per-business by KRA against your KRA PIN, which yields a device-specific
// CMC key. That can't be supplied generically by any codebase. This module
// is shaped to KRA's documented invoice payload and sandbox host, and fails
// loudly rather than fabricating a fiscal invoice until ETIMS_CMC_KEY and
// KRA_PIN are set.
import { query } from './db';

const BASE_URL = process.env.ETIMS_BASE_URL || 'https://etims-api-sbx.kra.go.ke';

import type {
  EtimsLineItem,
  EtimsInvoiceInput,
  EtimsSubmissionResult,
  EtimsQueueRow
} from '@/types';

export type {
  EtimsLineItem,
  EtimsInvoiceInput,
  EtimsSubmissionResult,
  EtimsQueueRow
};

/**
 * Builds the signed request payload KRA expects. The CMC key acts as a
 * shared secret rather than a per-request signature in most eTIMS device
 * integrations — it's sent as a header, not hashed into the body — but this
 * is broken out as its own function so you can swap in HMAC/device-specific
 * signing here if your onboarding docs specify one (KRA has iterated this
 * across OSCU/VSCU versions).
 */
export function buildInvoicePayload(sale: EtimsInvoiceInput, kraPin: string) {
  return {
    tin: kraPin,
    invoiceNumber: sale.receiptNumber,
    totalAmount: sale.totalAmount,
    taxAmount: sale.taxAmount,
    items: sale.items.map((it) => ({
      name: it.product_name,
      qty: it.quantity,
      unitPrice: it.unit_price,
      lineTotal: it.line_total,
      taxRate: 16 // Kenya standard VAT — adjust per item if you track exemptions
    }))
  };
}

/** Submits a single invoice directly to KRA. Throws if not configured or if KRA rejects it. */
export async function submitInvoice(sale: EtimsInvoiceInput): Promise<EtimsSubmissionResult> {
  const { ETIMS_CMC_KEY, KRA_PIN } = process.env;
  if (!ETIMS_CMC_KEY || !KRA_PIN) {
    throw new Error('eTIMS is not configured: set ETIMS_CMC_KEY and KRA_PIN after completing KRA OSCU/VSCU onboarding');
  }

  const payload = buildInvoicePayload(sale, KRA_PIN);

  const res = await fetch(`${BASE_URL}/etims/api/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CMC-KEY': ETIMS_CMC_KEY },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`eTIMS submission failed: ${res.status} ${JSON.stringify(data)}`);

  return {
    cuin: data.cuin || data.CUIN || null,
    qrUrl: data.qrUrl || data.qrCodeUrl || null,
    raw: data
  };
}

// ── Offline / compliance queue ──────────────────────────────────────────
// Every invoice attempt is logged in etims_queue — both the request payload
// and the outcome — so it doubles as the compliance audit trail, and so a
// till that loses connectivity to KRA mid-sale can keep selling and retry
// fiscalization later instead of blocking checkout.

export async function enqueueInvoice(saleId: string, sale: EtimsInvoiceInput) {
  const payload = buildInvoicePayload(sale, process.env.KRA_PIN || '');
  const result = await query<{ id: string }>(
    `INSERT INTO etims_queue (sale_id, receipt_number, payload, status)
     VALUES ($1, $2, $3, 'pending') RETURNING id`,
    [saleId, sale.receiptNumber, JSON.stringify(payload)]
  );
  return result.rows[0].id as string;
}

/** Attempts to submit a queued invoice and records the outcome. Never throws — caller checks the returned status. */
export async function processQueueEntry(queueId: string): Promise<{ status: 'submitted' | 'failed'; cuin?: string | null }> {
  const rows = await query<{ id: string; sale_id: string; receipt_number: string; payload: any; attempts: number }>(
    'SELECT * FROM etims_queue WHERE id = $1',
    [queueId]
  );
  const entry = rows.rows[0];
  if (!entry) throw new Error('Queue entry not found');

  const saleItems = await query<EtimsLineItem>(
    'SELECT product_name, quantity, unit_price, line_total FROM sale_items WHERE sale_id = $1',
    [entry.sale_id]
  );
  const saleRows = await query<{ total_amount: string; tax_amount: string }>(
    'SELECT total_amount, tax_amount FROM sales WHERE id = $1',
    [entry.sale_id]
  );
  const sale = saleRows.rows[0];

  try {
    const result = await submitInvoice({
      receiptNumber: entry.receipt_number,
      items: saleItems.rows,
      totalAmount: Number(sale?.total_amount || 0),
      taxAmount: Number(sale?.tax_amount || 0)
    });
    await query(
      `UPDATE etims_queue SET status='submitted', cuin=$1, qr_url=$2, attempts=attempts+1, last_error=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
      [result.cuin, result.qrUrl, queueId]
    );
    await query('UPDATE sales SET etims_cuin=$1, etims_qr_url=$2 WHERE id=$3', [result.cuin, result.qrUrl, entry.sale_id]);
    return { status: 'submitted', cuin: result.cuin };
  } catch (err: any) {
    await query(
      `UPDATE etims_queue SET status='failed', attempts=attempts+1, last_error=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
      [err.message, queueId]
    );
    return { status: 'failed' };
  }
}


export async function listQueue(status?: string): Promise<EtimsQueueRow[]> {
  if (status) {
    const result = await query<EtimsQueueRow>('SELECT * FROM etims_queue WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows;
  }
  const result = await query<EtimsQueueRow>('SELECT * FROM etims_queue ORDER BY created_at DESC LIMIT 200');
  return result.rows;
}
