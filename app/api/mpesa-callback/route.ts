import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseStkCallback } from '@/lib/mpesa';
import { submitInvoice, enqueueInvoice } from '@/lib/etims';
import { publish } from '@/lib/sse';

interface CartLineItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

function generateReceiptNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `LC-${stamp}-${rand}`;
}

/**
 * POST /api/mpesa-callback
 * Safaricom's Daraja webhook. No session auth — Safaricom calls this
 * directly, so point MPESA_CALLBACK_URL here in production.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // Always ack quickly — Daraja retries aggressively on non-200 responses.
  const ack = NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  const parsed = body ? parseStkCallback(body) : null;
  if (!parsed) return ack;

  try {
    const txResult = await query<any>('SELECT * FROM payment_transactions WHERE checkout_request_id = $1', [
      parsed.checkoutRequestId
    ]);
    const tx = txResult.rows[0];
    if (!tx) {
      console.warn('[mpesa-callback] Unknown CheckoutRequestID:', parsed.checkoutRequestId);
      return ack;
    }

    if (parsed.resultCode !== 0) {
      await query(`UPDATE payment_transactions SET status='failed', result_desc=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`, [
        parsed.resultDesc,
        tx.id
      ]);
      publish(parsed.checkoutRequestId, { status: 'failed', message: parsed.resultDesc });
      return ack;
    }

    const { items, tax_rate }: { items: CartLineItem[]; tax_rate: number } = tx.cart_snapshot || { items: [], tax_rate: 16 };
    const subtotal = items.reduce((s, i) => s + Number(i.line_total), 0);
    const taxAmount = +(subtotal - subtotal / (1 + tax_rate / 100)).toFixed(2);
    const receiptNumber = generateReceiptNumber();
    const amountPaid = parsed.amount ?? subtotal;

    const saleResult = await query<any>(
      `INSERT INTO sales (receipt_number, total_amount, tax_amount, payment_method, mpesa_code)
       VALUES ($1,$2,$3,'mpesa',$4) RETURNING *`,
      [receiptNumber, amountPaid, taxAmount, parsed.mpesaReceiptNumber]
    );
    const sale = saleResult.rows[0];

    for (const li of items) {
      await query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [sale.id, li.product_id, li.product_name, li.quantity, li.unit_price, li.line_total]
      );
      await query('UPDATE products SET stock_qty = stock_qty - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        li.quantity,
        li.product_id
      ]);
    }

    await query(
      `UPDATE payment_transactions SET status='paid', mpesa_code=$1, sale_id=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
      [parsed.mpesaReceiptNumber, sale.id, tx.id]
    );

    // eTIMS: log to the compliance queue and attempt immediately, but never
    // block confirming the sale on it.
    let etimsCuin: string | null = null;
    let etimsQrUrl: string | null = null;
    try {
      const invoiceInput = { receiptNumber, items, totalAmount: subtotal, taxAmount };
      const queueId = await enqueueInvoice(sale.id, invoiceInput);
      const result = await submitInvoice(invoiceInput);
      etimsCuin = result.cuin;
      etimsQrUrl = result.qrUrl;
      await query(`UPDATE etims_queue SET status='submitted', cuin=$1, qr_url=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`, [
        result.cuin,
        result.qrUrl,
        queueId
      ]);
      await query('UPDATE sales SET etims_cuin=$1, etims_qr_url=$2 WHERE id=$3', [result.cuin, result.qrUrl, sale.id]);
    } catch (err: any) {
      console.warn('[mpesa-callback] eTIMS submission queued for retry:', err.message);
    }

    publish(parsed.checkoutRequestId, {
      status: 'paid',
      saleId: sale.id,
      receiptNumber,
      mpesaCode: parsed.mpesaReceiptNumber,
      amount: amountPaid,
      etimsCuin,
      etimsQrUrl
    });
  } catch (err) {
    console.error('[mpesa-callback] unexpected error:', err);
  }

  return ack;
}
